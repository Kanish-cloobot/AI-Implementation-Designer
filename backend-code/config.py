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

# Azure OpenAI GPT-5 Mini Configuration for Meeting Extraction
AZURE_ENGINE_NAME_OPEN_AI_GPT_5_MINI_EUS2 = "gpt-5-mini-eus2"
AZURE_ENGINE_NAME_OPEN_AI_GPT_5_SC = "gpt-5-sc"
AZURE_ENGINE_NAME_OPEN_AI_GPT_5_MINI_SC = "gpt-5-mini-sc"

OPENAI_GPT5_CONFIGS = {
    AZURE_ENGINE_NAME_OPEN_AI_GPT_5_MINI_EUS2: {
        "azure_endpoint": "https://cloobot-openai-eastus2-v2.openai.azure.com/",
        "api_version": "2024-12-01-preview",
        "api_key": "E0rntmPkUeWJNvOumeZahJXHHhvGsAVfRt3oeuZ4MIlmm4vmpERhJQQJ99BFACHYHv6XJ3w3AAABACOGyD6J",
        "deployment": "gpt-5-mini",
        "max_tokens": 16000,
        "temperature": 0.3,
        "top_p": 0.95
    },
    AZURE_ENGINE_NAME_OPEN_AI_GPT_5_SC: {
        "azure_endpoint": "https://cloobot-openai-swedencentral-v2.openai.azure.com/",
        "api_version": "2024-12-01-preview",
        "api_key": "DSCJnZ3Y1l09b6ntOLB0oKHdF2hPR1FJGIOZ95jGb7pzGAWPZxTsJQQJ99BAACfhMk5XJ3w3AAABACOGYmoZ",
        "deployment": "gpt-5",
        "max_tokens": 16000,
        "temperature": 0.3,
        "top_p": 0.95
    },
    AZURE_ENGINE_NAME_OPEN_AI_GPT_5_MINI_SC: {
        "azure_endpoint": "https://cloobot-openai-swedencentral-v2.openai.azure.com/",
        "api_version": "2024-12-01-preview",
        "api_key": "DSCJnZ3Y1l09b6ntOLB0oKHdF2hPR1FJGIOZ95jGb7pzGAWPZxTsJQQJ99BAACfhMk5XJ3w3AAABACOGYmoZ",
        "deployment": "gpt-5-mini",
        "max_tokens": 16000,
        "temperature": 0.3,
        "top_p": 0.95
    }
}

