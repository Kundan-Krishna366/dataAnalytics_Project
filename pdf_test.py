from langchain_community.document_loaders import PyPDFLoader
loader = PyPDFLoader("Key_Duties1.pdf")
documents = loader.load()
print("Total pages:", len(documents))
print(documents[0].page_content[:500])