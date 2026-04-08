import re
import os
import numpy as np
import pandas as pd
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2
)

def load_pdf(path: str):
    try:
        loader = PyPDFLoader(path)
        documents = loader.load()
        if not documents:
            raise ValueError("PDF loaded but contains no pages.")
        logging.info(f"Loaded {len(documents)} pages from '{path}'")
        return documents
    except Exception as e:
        logging.error(f"Failed to load PDF: {e}")
        raise

documents = load_pdf("infosys.pdf")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
docs = splitter.split_documents(documents)
logging.info(f"Split into {len(docs)} chunks")

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
db = FAISS.from_documents(docs, embeddings)
retriever = db.as_retriever(search_kwargs={"k": 4})

rag_prompt = PromptTemplate(
    template="""Answer ONLY from the given context.
If the answer is not present, say "Not found in document."

Context:
{context}

Question:
{question}

Answer:""",
    input_variables=["context", "question"]
)

analytics_prompt = PromptTemplate(
    template="""You are a data analyst. Use ONLY the statistics below.
Do NOT assume trends or make up data.

Statistics:
{stats}

User's question: {question}

Provide 2-3 concise insights relevant to the question.
If the data is insufficient to answer, say so clearly.""",
    input_variables=["stats", "question"]
)

def run_analytics(documents, question: str) -> str:
    text = " ".join([doc.page_content for doc in documents])
    numbers = re.findall(r"\b\d{3,}\b", text)

    if not numbers:
        return "No valid numerical data found in the document."

    values = list(map(int, numbers))
    df = pd.DataFrame(values, columns=["values"])
    df = df[(df["values"] > 0) & (df["values"] < df["values"].quantile(0.99))]

    if df.empty:
        return "After filtering, no valid numerical data remains."

    cleaned = df["values"].values
    stats = (
        f"Count  : {len(cleaned)}\n"
        f"Mean   : {np.mean(cleaned):.2f}\n"
        f"Median : {np.median(cleaned):.2f}\n"
        f"Max    : {np.max(cleaned):.2f}\n"
        f"Min    : {np.min(cleaned):.2f}\n"
        f"Std Dev: {np.std(cleaned):.2f}"
    )

    final_prompt = analytics_prompt.format(stats=stats, question=question)
    response = llm.invoke(final_prompt)
    return response.content  # ChatGroq returns AIMessage object

ANALYTICS_KEYWORDS = {
    "mean", "average", "median", "analyze", "analysis",
    "max", "min", "maximum", "minimum", "statistics",
    "std", "deviation", "numbers", "figures", "data insight"
}

def is_analytics_query(question: str) -> bool:
    words = set(question.lower().split())
    return bool(words & ANALYTICS_KEYWORDS)

def run_rag(question: str) -> str:
    relevant_docs = retriever.invoke(question)
    if not relevant_docs:
        return "No relevant content found in the document."

    context = "\n\n---\n".join(
        [f"[Chunk {i+1}]:\n{doc.page_content}" for i, doc in enumerate(relevant_docs)]
    )
    final_prompt = rag_prompt.format(context=context, question=question)
    response = llm.invoke(final_prompt)
    return response.content  # ChatGroq returns AIMessage object

print("\n🤖 PDF Q&A System Ready | Type 'exit' to quit\n")

while True:
    question = input("Ask your question: ").strip()

    if not question:
        continue
    if question.lower() == "exit":
        print("Goodbye!")
        break

    try:
        if is_analytics_query(question):
            print("\n📊 Analytics Mode\n")
            answer = run_analytics(documents, question)
        else:
            print("\n📄 RAG Mode\n")
            answer = run_rag(question)

        print("\n💡 Answer:\n", answer)

    except Exception as e:
        logging.error(f"Error processing question: {e}")
        print("⚠️ Something went wrong. Please try again.")