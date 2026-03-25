from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

# Load model
llm = OllamaLLM(model="gemma3:1b")

# Your custom data (simulate PDF for now)
context = """
The company's revenue in 2023 was 100 million dollars.
In 2024, revenue increased to 150 million dollars.
"""

# Create prompt
prompt = PromptTemplate(
    template="""
    Answer ONLY from the given context.

    Context:
    {context}

    Question:
    {question}
    """,
    input_variables=["context", "question"]
)

# Ask question
question = "What is the revenue in 2023?"

# Format input
final_prompt = prompt.format(context=context, question=question)

# Get response
response = llm.invoke(final_prompt)

print(response)