import re
import numpy as np
import pandas as pd
from langchain_ollama import OllamaLLM
from langchain_community.document_loaders import PyPDFLoader

# Load LLM
llm = OllamaLLM(model="gemma3:1b")

# Load PDF
loader = PyPDFLoader("infosys.pdf")
documents = loader.load()

# Combine all text
text = " ".join([doc.page_content for doc in documents])

# Extract numbers
numbers = re.findall(r"\d{3,}", text)  # only bigger numbers
numbers = list(map(int, numbers))

# remove extreme outliers (optional)
numbers = [n for n in numbers if n < 10**9]

# Convert to DataFrame
df = pd.DataFrame(numbers, columns=["values"])

# Basic analytics
mean_val = np.mean(numbers)
max_val = np.max(numbers)
min_val = np.min(numbers)

print("Mean:", mean_val)
print("Max:", max_val)
print("Min:", min_val)

# AI explanation
analysis = f"""
Mean value: {mean_val}
Max value: {max_val}
Min value: {min_val}
"""

prompt = f"""
You are a data analyst.

Analyze this financial data and give meaningful insights:

{analysis}

Focus on:
- trends
- possible anomalies
- business interpretation
"""

response = llm.invoke(prompt)

print("\nAI Insight:\n", response)