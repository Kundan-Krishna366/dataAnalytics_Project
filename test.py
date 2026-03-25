from langchain_ollama import OllamaLLM
llm = OllamaLLM(model="gemma3:1b")
response = llm.invoke("Explain data analytics in 2 lines")
print(response)