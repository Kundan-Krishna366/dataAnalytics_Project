import re
import os
import shutil
import uuid
import numpy as np
import pandas as pd
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

app = FastAPI(title="Intelligence Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = {
    "documents": None,
    "retriever": None,
    "db": None
}

STRICT_SYSTEM_PROMPT = """You are a strict Document Intelligence Bot. 
Your ONLY knowledge source is the context provided below.

RULES:
1. ONLY answer based on the provided context or statistics.
2. If the answer is not in the context, strictly say: "I'm sorry, but that information is not available in the uploaded document."
3. Do NOT use your internal general knowledge to answer.
4. Maintain a professional, technical tone."""

def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.1
    )

llm = get_llm()
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def extract_analytics_logic(documents):
    if not documents: 
        return None, [], ""
    
    text = " ".join([doc.page_content for doc in documents])
    raw_numbers = re.findall(r"\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b", text)
    
    cleaned_values = []
    for n in raw_numbers:
        try:
            val = float(n.replace(',', ''))
            if 2000 <= val <= 2030: continue
            if val < 20: continue 
            if 1000000000 <= val <= 9999999999: continue
            cleaned_values.append(val)
        except:
            continue

    if len(cleaned_values) < 5:
        years = sorted(set(re.findall(r"\b20\d{2}\b", text)))
        return None, years, text
        
    df = pd.DataFrame(cleaned_values, columns=["values"])
    if len(df) > 15:
        df = df[df["values"] < df["values"].quantile(0.98)]
    
    years = sorted(set(re.findall(r"\b20\d{2}\b", text)))
    return df, years, text

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    session_id = uuid.uuid4().hex[:8]
    temp_path = f"temp_{session_id}.pdf"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        docs = splitter.split_documents(documents)
        db = FAISS.from_documents(docs, embeddings)
        
        storage["documents"] = documents
        storage["db"] = db
        storage["retriever"] = db.as_retriever(search_kwargs={"k": 10})
        
        df, years, _ = extract_analytics_logic(documents)
        
        stats = {
            "has_analytics": df is not None,
            "total_points": len(df) if df is not None else 0,
            "mean": float(df["values"].mean()) if df is not None else 0,
            "max": float(df["values"].max()) if df is not None else 0,
            "years": years,
            "raw_values": df["values"].tolist() if df is not None else []
        }

        return {"status": "success", "filename": file.filename, "stats": stats}
    
    except Exception as e:
        logging.error(f"Ingestion Failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process PDF")

@app.post("/chat")
async def chat(question: str = Form(...)):
    if not storage["retriever"]:
        raise HTTPException(status_code=400, detail="No document indexed")

    analytics_keywords = ["average", "mean", "max", "min", "stats", "total", "count", "highest", "lowest"]
    is_asking_for_stats = any(k in question.lower() for k in analytics_keywords)
    
    df, years, _ = extract_analytics_logic(storage["documents"])
    
    if is_asking_for_stats and df is not None:
        vals = df["values"].values
        stats_summary = (f"Numerical Summary: Data Points={len(vals)}, "
                         f"Mean={np.mean(vals):.2f}, Peak={np.max(vals):.2f}, "
                         f"Min={np.min(vals):.2f}, Years Detected={years}")
        
        prompt = f"{STRICT_SYSTEM_PROMPT}\n\nSystem Stats: {stats_summary}\nUser Question: {question}"
        response = llm.invoke(prompt)
    else:
        docs = storage["retriever"].invoke(question)
        context = "\n\n---\n".join([d.page_content for d in docs])
        prompt = f"{STRICT_SYSTEM_PROMPT}\n\nCONTEXT FROM PDF:\n{context}\n\nUSER QUESTION: {question}"
        response = llm.invoke(prompt)

    return {"answer": response.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)