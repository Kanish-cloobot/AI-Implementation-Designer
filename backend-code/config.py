import os

# Azure OpenAI Configuration
OPENAI_CONFIG = {
    "azure_endpoint": os.environ.get(
        "AZURE_OPENAI_ENDPOINT",
        "https://idsgpt4o.openai.azure.com/"
    ),
    "api_version": os.environ.get(
        "AZURE_OPENAI_API_VERSION",
        "2024-08-01-preview"
    ),
    "api_key": os.environ.get(
        "AZURE_OPENAI_API_KEY",
        "22e36c76c51c451c95eaa87c48754947"
    ),
    "deployment": os.environ.get(
        "AZURE_OPENAI_DEPLOYMENT",
        "GPT4o"
    ),
    "max_tokens": 4000,
    "temperature": 0.7,
    "top_p": 0.9
}

