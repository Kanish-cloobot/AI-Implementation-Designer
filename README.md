# AI Implementation Designer

A comprehensive Salesforce implementation planning tool that uses AI to extract insights from Statement of Work (SoW) documents.

## Project Overview

This application helps Salesforce implementation consultants by:
- Managing implementation workspaces
- Extracting key information from SoW documents using AI
- Displaying structured insights including scope, modules, stakeholders, and licenses
- Providing a modern, intuitive interface following Material Design 3 principles

## Tech Stack

### Frontend
- **React 18.2.0** - Modern UI framework
- **Axios** - HTTP client for API calls
- **Material Design 3** - Dark mode design system
- **Montserrat Font** - Typography
- **Material Symbols** - Icons

### Backend
- **Flask 2.3.2** - Python web framework
- **SQLite** - Embedded database
- **OpenAI GPT-4** - AI-powered document analysis
- **PyPDF2** - PDF text extraction
- **python-docx** - Word document processing

## Project Structure

```
AI-Implementation-Designer/
├── ids_frontend/          # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── common/   # Button, Input, Select, Modal, Spinner
│   │   │   └── layout/   # Header, Sidebar, PageWrapper
│   │   ├── features/     # Feature-specific components
│   │   │   ├── workspaces/
│   │   │   ├── documents/
│   │   │   └── viewer/
│   │   ├── contexts/     # React Context for state management
│   │   ├── services/     # API service layer
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── backend-code/         # Flask backend application
    ├── database/         # Database management
    ├── routes/          # API endpoints
    ├── services/        # Business logic
    ├── server.py        # Main application entry
    └── requirements.txt
```

## Features

### Phase 1: Workspace Management
- Create, edit, and delete workspaces
- Configure project type (Greenfield/Enhancement)
- Select Salesforce licenses

### Phase 2: Document Processing
- Upload SoW/Sales handoff documents (PDF, DOC, DOCX, TXT)
- AI-powered extraction using GPT-4
- Real-time processing feedback

### Phase 3: SoW Viewer
- Structured display of extracted insights:
  - Project scope (in-scope/out-of-scope)
  - Modules and processes
  - Business units and stakeholders
  - Salesforce licenses
  - Assumptions and validation summary

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- OpenAI API key

### Frontend Setup

```bash
cd ids_frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### Backend Setup

1. Create a virtual environment:
```bash
cd backend-code
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
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=./database/ids.db
UPLOAD_FOLDER=./uploads
```

4. Run the server:
```bash
python server.py
```

The backend will run on `http://localhost:5000`

## API Endpoints

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace

### Documents
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/:id/process` - Process document with AI
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/workspace/:workspace_id` - Get documents by workspace

### LLM Streams
- `GET /api/llm-streams/document/:document_id/latest` - Get latest AI extraction

## Design System

### Colors
- **Color 1 (#0D0D0D)** - Base background
- **Color 2 (#1A1A1A)** - Panel background
- **Color 3 (#262626)** - Button default state
- **Color 4 (#333333)** - Button hover state
- **Color 5 (#404040)** - Button active state
- **Color 6 (#4D4D4D)** - Highest elevation (rare)
- **Color 7 (#FFFFFF)** - Text color
- **Accent (#C82FFF)** - Primary accent
- **X Gradient** - (#C82FFF to #00AAFF) - CTA buttons
- **Placeholder (#A8A8A8)** - Borders and hints

### Typography
- **Font Family**: Montserrat (Regular, Medium, Semi-bold)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold)

### Icons
- **Library**: Google Material Symbols
- **Weight**: 200
- **Fill**: Off (outline style)

## Development Guidelines

### Frontend
- Use external CSS only (no inline styles)
- Follow ESLint rules (complexity ≤ 10, max lines ≤ 75)
- Use pixels instead of rem values
- Component files should be ≤ 300 lines

### Backend
- Follow PEP 8 style guidelines
- Use type hints for functions
- Line length ≤ 120 characters
- File length ≤ 300-350 lines
- Always include error handling and logging

## Testing

### Frontend
```bash
cd ids_frontend
npm test
npm run lint
```

### Backend
Create test files in `backend-code/tests/` and run with pytest

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the development team.

