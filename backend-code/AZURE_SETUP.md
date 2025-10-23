# Azure OpenAI Setup Guide

This guide will help you configure Azure OpenAI for the AI Implementation Designer application.

## Prerequisites

- Azure subscription
- Access to Azure OpenAI service (requires application approval)

## Step 1: Create Azure OpenAI Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure OpenAI"
4. Click "Create"
5. Fill in the required information:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region (e.g., East US)
   - **Name**: Give your resource a name (e.g., "ids-openai")
   - **Pricing Tier**: Select appropriate tier

## Step 2: Deploy GPT-4 Model

1. Navigate to your Azure OpenAI resource
2. Go to "Azure OpenAI Studio" (click "Go to Azure OpenAI Studio")
3. Click "Deployments" in the left menu
4. Click "Create new deployment"
5. Configure deployment:
   - **Model**: Select "gpt-4" or "gpt-4-32k"
   - **Deployment name**: `GPT4o` (or your preferred name)
   - **Model version**: Latest available
6. Click "Create"

## Step 3: Get Your Configuration Details

### Endpoint URL
1. In Azure Portal, go to your Azure OpenAI resource
2. Click "Keys and Endpoint" in the left menu
3. Copy the "Endpoint" value
   - Example: `https://idsgpt4o.openai.azure.com/`

### API Key
1. In the same "Keys and Endpoint" page
2. Copy "KEY 1" or "KEY 2"
   - Example: `22e36c76c51c451c95eaa87c48754947`

### API Version
- Default: `2024-08-01-preview`
- Check [Azure OpenAI API versions](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference) for latest

### Deployment Name
- This is the name you gave in Step 2 (e.g., `GPT4o`)

## Step 4: Configure the Application

Create a `.env` file in the `backend-code` directory:

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_DEPLOYMENT=GPT4o

# Other Configuration
FLASK_APP=server.py
FLASK_ENV=development
DATABASE_PATH=./database/ids.db
UPLOAD_FOLDER=./uploads
```

Replace the values with your actual configuration:
- `AZURE_OPENAI_ENDPOINT`: Your endpoint from Step 3
- `AZURE_OPENAI_API_KEY`: Your API key from Step 3
- `AZURE_OPENAI_DEPLOYMENT`: Your deployment name from Step 2

## Step 5: Test the Configuration

1. Start the backend server:
```bash
cd backend-code
python server.py
```

2. Upload a test document through the UI
3. Check the console for successful API calls:
```
Azure OpenAI call successful - Tokens: 2500, Latency: 3500ms
```

## Troubleshooting

### Authentication Error
- **Problem**: `AuthenticationError: Incorrect API key provided`
- **Solution**: Verify your API key is correct and not expired

### Deployment Not Found
- **Problem**: `DeploymentNotFound: The API deployment for this resource does not exist`
- **Solution**: Verify your deployment name matches exactly (case-sensitive)

### Rate Limiting
- **Problem**: `RateLimitError: Requests to the API are being rate limited`
- **Solution**: 
  - Check your Azure OpenAI quota
  - Consider upgrading your pricing tier
  - Implement request queuing in your application

### Invalid Endpoint
- **Problem**: `InvalidRequestError: Invalid URL`
- **Solution**: Ensure endpoint includes trailing slash and uses HTTPS

## Azure OpenAI Pricing

Azure OpenAI pricing is based on:
- **Tokens processed**: Input + output tokens
- **Model type**: GPT-4 is more expensive than GPT-3.5
- **Pricing tier**: Different tiers have different rates

Example (subject to change):
- GPT-4 (8K context): ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- GPT-4 (32K context): ~$0.06 per 1K input tokens, ~$0.12 per 1K output tokens

For current pricing, check: [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)

## Best Practices

1. **Secure Your Keys**:
   - Never commit `.env` file to version control
   - Use Azure Key Vault for production
   - Rotate keys regularly

2. **Monitor Usage**:
   - Set up cost alerts in Azure
   - Monitor token usage in application logs
   - Track API latency

3. **Optimize Costs**:
   - Cache common responses
   - Optimize prompt length
   - Use appropriate temperature settings
   - Consider using GPT-3.5 for simpler tasks

4. **Error Handling**:
   - Implement retry logic with exponential backoff
   - Set appropriate timeout values
   - Log all errors for debugging

## Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure OpenAI API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)
- [Azure OpenAI Quotas and Limits](https://learn.microsoft.com/en-us/azure/ai-services/openai/quotas-limits)
- [Azure OpenAI Best Practices](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/advanced-prompt-engineering)

## Support

For Azure OpenAI specific issues:
- [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- [Azure OpenAI Community](https://techcommunity.microsoft.com/t5/azure-ai-services-blog/bg-p/Azure-AI-Services-blog)

For application issues:
- Check application logs in `backend-code/`
- Review error messages in console
- Verify all configuration values are correct

