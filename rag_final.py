from langchain_ollama import OllamaLLM
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Load LLM
llm = OllamaLLM(model="gemma3:1b")

# 2. Load PDF
loader = PyPDFLoader("infosys.pdf")
documents = loader.load()

# 3. Split into chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)
docs = splitter.split_documents(documents)

# 4. Embeddings (clean download now)
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 5. FAISS DB
db = FAISS.from_documents(docs, embeddings)

# 6. Retriever
retriever = db.as_retriever()

# 7. Prompt
prompt = PromptTemplate(
    template="""
    Answer ONLY from the given context.
    If answer is not present, say "Not found in document".

    Context:
    {context}

    Question:
    {question}
    """,
    input_variables=["context", "question"]
)

# 8. Ask question
question = "What is the revenue in 2023?"

# 9. Retrieve relevant chunks
relevant_docs = retriever.invoke(question)
context = "\n".join([doc.page_content for doc in relevant_docs])

# 10. Ask LLM
final_prompt = prompt.format(context=context, question=question)
response = llm.invoke(final_prompt)

print("\nAnswer:\n", response)