# Complete Setup and Run Guide

This guide provides step-by-step instructions to set up and run the AI Implementation Designer application.

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 16+** installed ([Download](https://nodejs.org/))
- **Python 3.8+** installed ([Download](https://www.python.org/))
- **Azure OpenAI access** with API credentials

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Project Directory

```bash
cd AI-Implementation-Designer
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend-code
```

#### 2.2 Create Python Virtual Environment
```bash
# On Windows:
python -m venv venv
venv\Scripts\activate

# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

#### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- Flask 2.3.2
- Flask-CORS 4.0.0
- python-dotenv 1.0.0
- openai 0.28.1 (Azure OpenAI compatible)
- PyPDF2 3.0.1
- python-docx 0.8.11

#### 2.4 Create Environment File

Create a file named `.env` in the `backend-code` directory:

```bash
# On Windows (PowerShell):
New-Item .env -Type File

# On Mac/Linux:
touch .env
```

#### 2.5 Configure Environment Variables

Open `.env` file and add the following:

```env
# Flask Configuration
FLASK_APP=server.py
FLASK_ENV=development
PORT=5000

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://idsgpt4o.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_API_KEY=22e36c76c51c451c95eaa87c48754947
AZURE_OPENAI_DEPLOYMENT=GPT4o

# Database Configuration
DATABASE_PATH=./database/ids.db

# File Upload Configuration
UPLOAD_FOLDER=./uploads
```

**Important**: Replace the Azure OpenAI values with your actual credentials:
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Your GPT-4 deployment name

#### 2.6 Start the Backend Server

```bash
python server.py
```

You should see:
```
 * Serving Flask app 'server'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

**✅ Backend is now running on http://localhost:5000**

### Step 3: Frontend Setup

Open a **NEW terminal window** (keep the backend running).

#### 3.1 Navigate to Frontend Directory
```bash
cd AI-Implementation-Designer/ids_frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

This will install all React dependencies (may take 2-3 minutes).

#### 3.3 Create Frontend Environment File (Optional)

Create `.env` file in `ids_frontend` directory:

```bash
# On Windows (PowerShell):
New-Item .env -Type File

# On Mac/Linux:
touch .env
```

Add:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

#### 3.4 Start the Frontend Development Server

```bash
npm start
```

The browser will automatically open at `http://localhost:3000`

**✅ Frontend is now running on http://localhost:3000**

## 📁 Database Location and Information

### Database Path
The SQLite database will be automatically created at:
```
backend-code/database/ids.db
```

### How Database is Created
1. When you start the backend server for the first time
2. The `DatabaseManager` automatically runs `initialize_database()`
3. It creates the `database/` folder if it doesn't exist
4. It creates `ids.db` file with all tables

### Database Schema

The database contains 3 tables:

#### 1. **workspaces** table
```
workspace_id     TEXT PRIMARY KEY
name             TEXT NOT NULL
project_type     TEXT NOT NULL
status           TEXT DEFAULT 'active'
licenses         TEXT (JSON array)
created_by       TEXT
created_at       TIMESTAMP
updated_by       TEXT
updated_at       TIMESTAMP
```

#### 2. **documents** table
```
document_id      TEXT PRIMARY KEY
workspace_id     TEXT (Foreign Key)
document_type    TEXT NOT NULL
file_name        TEXT NOT NULL
storage_path     TEXT NOT NULL
status           TEXT DEFAULT 'uploaded'
created_by       TEXT
created_at       TIMESTAMP
updated_by       TEXT
updated_at       TIMESTAMP
```

#### 3. **llm_streams** table
```
stream_id        TEXT PRIMARY KEY
document_id      TEXT (Foreign Key)
request_payload  TEXT
response_payload TEXT (JSON)
tokens_used      INTEGER
latency_ms       INTEGER
status           TEXT DEFAULT 'success'
created_by       TEXT
created_at       TIMESTAMP
updated_by       TEXT
updated_at       TIMESTAMP
```

### Viewing Database Contents

You can view the database using:

**Option 1: SQLite Browser**
1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `backend-code/database/ids.db`
3. Browse tables and data

**Option 2: Command Line**
```bash
cd backend-code
sqlite3 database/ids.db

# View tables
.tables

# View workspace data
SELECT * FROM workspaces;

# View documents
SELECT * FROM documents;

# Exit
.quit
```

**Option 3: VS Code Extension**
1. Install "SQLite Viewer" extension
2. Right-click on `ids.db` file
3. Select "Open Database"

## 🎯 Test the Application

### Test 1: Create a Workspace

1. Open http://localhost:3000
2. Click **"New Workspace"** button
3. Fill in the form:
   - **Workspace Name**: "Test Implementation"
   - **Project Type**: Select "Greenfield"
   - **Salesforce Licenses**: Select "Sales Cloud" and "Service Cloud"
4. Click **"Create"**

### Test 2: Upload Sample Document

1. After creating workspace, a modal will appear
2. Upload the sample SoW:
   - Navigate to: `backend-code/sample_sow.txt`
   - Drag and drop the file OR click to browse
3. Click **"Upload & Process"**
4. Wait for processing (30-60 seconds)

### Test 3: View Extracted Insights

The SoW Viewer will automatically display:
- ✅ Project Scope (in-scope/out-of-scope)
- ✅ Modules and Processes
- ✅ Business Units and Stakeholders
- ✅ Salesforce Licenses
- ✅ Assumptions
- ✅ Validation Summary

## 📂 File Storage Locations

### Uploaded Documents
All uploaded files are stored in:
```
backend-code/uploads/
```

Files are saved as: `{document_id}.{extension}`
Example: `987e6543-e21b-98d7-a654-426614174111.pdf`

### Database File
```
backend-code/database/ids.db
```

### Logs
Console output in both terminal windows

## 🛑 Stopping the Application

### Stop Backend
In the backend terminal:
- **Windows**: Press `Ctrl + C`
- **Mac/Linux**: Press `Ctrl + C`

### Stop Frontend
In the frontend terminal:
- **Windows**: Press `Ctrl + C`
- **Mac/Linux**: Press `Ctrl + C`

## 🔄 Restarting the Application

### Restart Backend
```bash
cd backend-code
# Activate virtual environment (if not already active)
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
python server.py
```

### Restart Frontend
```bash
cd ids_frontend
npm start
```

## 🗑️ Resetting the Application

### Clear Database
Delete and recreate:
```bash
# On Windows (PowerShell):
Remove-Item backend-code\database\ids.db
# Restart backend to recreate

# On Mac/Linux:
rm backend-code/database/ids.db
# Restart backend to recreate
```

### Clear Uploads
```bash
# On Windows (PowerShell):
Remove-Item backend-code\uploads\* -Recurse

# On Mac/Linux:
rm -rf backend-code/uploads/*
```

## ⚙️ Configuration Reference

### Backend Configuration (backend-code/.env)
| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_APP` | server.py | Flask entry point |
| `FLASK_ENV` | development | Environment mode |
| `PORT` | 5000 | Backend port |
| `AZURE_OPENAI_ENDPOINT` | (required) | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_API_KEY` | (required) | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | GPT4o | Deployment name |
| `AZURE_OPENAI_API_VERSION` | 2024-08-01-preview | API version |
| `DATABASE_PATH` | ./database/ids.db | Database file path |
| `UPLOAD_FOLDER` | ./uploads | Upload directory |

### Frontend Configuration (ids_frontend/.env)
| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_BASE_URL` | http://localhost:5000/api | Backend API URL |

## 🐛 Troubleshooting

### Backend won't start
**Error**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: 
```bash
# Make sure virtual environment is activated
# Then reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't start
**Error**: `Command not found: npm`
**Solution**: Install Node.js from https://nodejs.org/

### Port already in use
**Error**: `Address already in use`
**Solution**:
```bash
# On Windows (find and kill process on port 5000):
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Azure OpenAI Authentication Error
**Error**: `AuthenticationError: Incorrect API key`
**Solution**: 
1. Verify your API key in `.env`
2. Check endpoint URL is correct
3. Verify deployment name matches Azure

### Database Error
**Error**: `OperationalError: unable to open database file`
**Solution**:
```bash
# Create directory manually
mkdir backend-code/database
# Restart backend
```

## 📊 Monitoring

### Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

### View Backend Logs
All logs appear in the backend terminal window:
- API requests
- Database operations
- Azure OpenAI calls with token usage
- Errors with stack traces

### View Frontend Logs
- Browser console (F12 → Console tab)
- Network tab for API calls
- Terminal output for build warnings

## 🎓 Next Steps

1. **Customize the Application**: Modify colors, add features
2. **Add Authentication**: Implement user login
3. **Deploy to Production**: Follow deployment guides
4. **Integrate with Azure**: Use Azure services for production

## 📚 Additional Resources

- [Full Documentation](README.md)
- [Quick Start Guide](QUICK_START.md)
- [Azure Setup Guide](backend-code/AZURE_SETUP.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Project Summary](PROJECT_SUMMARY.md)

## ✅ Checklist

Before running:
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Virtual environment created and activated
- [ ] Dependencies installed (both frontend and backend)
- [ ] `.env` file created with Azure OpenAI credentials
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Sample SoW document ready for testing

After setup:
- [ ] Database created at `backend-code/database/ids.db`
- [ ] Can access http://localhost:3000
- [ ] Backend health check returns "healthy"
- [ ] Created test workspace successfully
- [ ] Uploaded and processed sample document
- [ ] Viewed extracted insights in SoW viewer

---

**🎉 You're all set! Enjoy using the AI Implementation Designer!**

