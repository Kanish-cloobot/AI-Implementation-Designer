# Backend API

Flask backend for the AI Implementation Designer application.

## Getting Started

### Prerequisites
- Python 3.8+
- pip
- Azure OpenAI API key and endpoint

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:
```bash
FLASK_APP=server.py
FLASK_ENV=development
AZURE_OPENAI_ENDPOINT=https://idsgpt4o.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT=GPT4o
DATABASE_PATH=./database/ids.db
UPLOAD_FOLDER=./uploads
```

4. Run the server:
```bash
python server.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Workspaces
- `GET /api/workspaces` - Get all active workspaces
- `GET /api/workspaces/<id>` - Get workspace by ID
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/<id>` - Update workspace
- `DELETE /api/workspaces/<id>` - Soft delete workspace

### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/<id>/process` - Process with AI
- `GET /api/documents/<id>` - Get document by ID
- `GET /api/documents/workspace/<workspace_id>` - Get all documents for workspace

### LLM Streams
- `GET /api/llm-streams/document/<document_id>/latest` - Get latest extraction
- `GET /api/llm-streams/<stream_id>` - Get stream by ID

## Project Structure

```
backend-code/
├── database/
│   └── db_manager.py    # Database operations
├── routes/
│   ├── workspace_routes.py
│   ├── document_routes.py
│   └── llm_routes.py
├── services/
│   ├── llm_service.py
│   └── document_processor.py
├── tests/
│   ├── test_workspaces.py
│   └── test_document_processing.py
├── server.py            # Main application
└── requirements.txt
```

## Database Schema

### workspaces
- workspace_id (PK)
- name
- project_type
- status
- licenses (JSON)
- created_at, updated_at
- created_by, updated_by

### documents
- document_id (PK)
- workspace_id (FK)
- document_type
- file_name
- storage_path
- status
- created_at, updated_at
- created_by, updated_by

### llm_streams
- stream_id (PK)
- document_id (FK)
- request_payload
- response_payload
- tokens_used
- latency_ms
- status
- created_at, updated_at
- created_by, updated_by

## Testing

Run test files to verify functionality:

```bash
# Workspace tests
python tests/test_workspaces.py

# Document processing tests
python tests/test_document_processing.py
```

## Code Quality

Follow PEP 8 guidelines:
- Line length ≤ 120 characters
- Function length ≤ 75 lines
- Complexity ≤ 10
- Use type hints
- Proper error handling

## LLM Integration

The application uses Azure OpenAI's GPT-4 to extract insights from SoW documents. The extraction follows a structured prompt that identifies:
- Project scope (in/out of scope)
- Modules and processes
- Business units and stakeholders
- Salesforce licenses
- Assumptions

### Azure OpenAI Configuration

The application uses Azure OpenAI service with the following configurable parameters:
- **Endpoint**: Your Azure OpenAI endpoint URL
- **API Version**: API version (default: 2024-08-01-preview)
- **Deployment**: Your GPT-4 deployment name
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 4000 (for comprehensive responses)
- **Top P**: 0.9 (nucleus sampling)

## Development

For development with auto-reload:
```bash
FLASK_ENV=development python server.py
```

## Production Deployment

1. Set environment to production
2. Use a production WSGI server (e.g., Gunicorn)
3. Set up proper database backups
4. Configure CORS for production domains
5. Secure API keys and sensitive data

