# Quick Start Guide

Get the AI Implementation Designer up and running in minutes!

## Prerequisites

- **Node.js 16+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/)
- **Azure OpenAI API Key** - Get from your Azure portal

## Step 1: Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend-code

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
# Add your Azure OpenAI configuration
echo "FLASK_APP=server.py" > .env
echo "FLASK_ENV=development" >> .env
echo "AZURE_OPENAI_ENDPOINT=https://idsgpt4o.openai.azure.com/" >> .env
echo "AZURE_OPENAI_API_VERSION=2024-08-01-preview" >> .env
echo "AZURE_OPENAI_API_KEY=your_key_here" >> .env
echo "AZURE_OPENAI_DEPLOYMENT=GPT4o" >> .env
echo "DATABASE_PATH=./database/ids.db" >> .env
echo "UPLOAD_FOLDER=./uploads" >> .env

# Start the backend server
python server.py
```

Backend will run on `http://localhost:5000`

## Step 2: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd ids_frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will open automatically at `http://localhost:3000`

## Step 3: Test the Application

### Create a Workspace

1. Click "New Workspace" button
2. Fill in the form:
   - **Workspace Name**: "Test Implementation"
   - **Project Type**: Select "Greenfield" or "Enhancement"
   - **Salesforce Licenses**: Select one or more licenses
3. Click "Create"

### Upload a Document

1. After creating the workspace, a modal will appear
2. Drag and drop the `backend-code/sample_sow.txt` file, or click to browse
3. Click "Upload & Process"
4. Wait for AI processing (this may take 30-60 seconds)

### View Results

1. The SoW Viewer will display automatically
2. Explore the extracted insights:
   - **Project Scope** - In-scope and out-of-scope items
   - **Modules & Processes** - Click to expand each module
   - **Stakeholders** - Business units and contacts
   - **Licenses** - Identified Salesforce licenses
   - **Assumptions** - AI-generated assumptions
   - **Validation Summary** - Data quality check

## Common Issues

### Backend won't start
- **Issue**: `ModuleNotFoundError`
- **Solution**: Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

### Frontend won't connect to backend
- **Issue**: API calls failing
- **Solution**: Ensure backend is running on port 5000 and check `.env` file

### Azure OpenAI API errors
- **Issue**: Authentication error
- **Solution**: Verify your Azure OpenAI API key, endpoint, and deployment name are correct

### Database errors
- **Issue**: Database file not found
- **Solution**: The database will be created automatically on first run. Ensure the `database/` directory can be created.

## Next Steps

### Customize the Application

1. **Add more license types**: Edit `ids_frontend/src/features/workspaces/WorkspaceForm.js`
2. **Modify the LLM prompt**: Edit `backend-code/services/llm_service.py`
3. **Change design colors**: Update CSS variables in component stylesheets

### Production Deployment

1. **Frontend**: 
   ```bash
   cd ids_frontend
   npm run build
   # Deploy the build/ folder to your hosting service
   ```

2. **Backend**:
   ```bash
   # Use Gunicorn or similar WSGI server
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 server:app
   ```

## Testing

### Frontend Tests
```bash
cd ids_frontend
npm test
npm run lint
```

### Backend Tests
```bash
cd backend-code
python tests/test_workspaces.py
python tests/test_document_processing.py
```

## Features Checklist

- ✅ Create, edit, delete workspaces
- ✅ Upload documents (PDF, DOC, DOCX, TXT)
- ✅ AI-powered extraction with GPT-4
- ✅ Structured SoW viewer
- ✅ Material Design 3 dark mode UI
- ✅ Responsive design
- ✅ Error handling and validation

## Support

For issues or questions:
1. Check the main [README.md](README.md)
2. Review the [Frontend README](ids_frontend/README.md)
3. Review the [Backend README](backend-code/README.md)

## Architecture Overview

```
User Interface (React)
        ↓
    API Layer (Axios)
        ↓
Backend API (Flask)
        ↓
    ┌───┴───┐
    ↓       ↓
Database  LLM Service
(SQLite)  (OpenAI GPT-4)
```

Happy coding! 🚀

