from langchain_ollama import OllamaLLM
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate

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

# 4. Combine all text (simple version first)
context = "\n".join([doc.page_content for doc in docs[:5]])  
# (we limit to first 5 chunks for now)

# 5. Prompt
prompt = PromptTemplate(
    template="""
    Answer ONLY from the given PDF context.
    If answer is not present, say "Not found in document".

    Context:
    {context}

    Question:
    {question}
    """,
    input_variables=["context", "question"]
)

# 6. Ask question
question = "What is the main topic of this document?"

final_prompt = prompt.format(context=context, question=question)

# 7. Get answer
response = llm.invoke(final_prompt)

print("\nAnswer:\n", response)