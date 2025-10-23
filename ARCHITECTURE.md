# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                     http://localhost:3000                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (PORT 3000)                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components                                           │  │
│  │  ├─ Common (Button, Input, Select, Modal, Spinner)   │  │
│  │  └─ Layout (Header, Sidebar, PageWrapper)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Features                                             │  │
│  │  ├─ Workspaces (List, Form)                          │  │
│  │  ├─ Documents (Upload Modal)                         │  │
│  │  └─ Viewer (SoW, Scope, Modules, Stakeholders)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Contexts & Services                                  │  │
│  │  ├─ WorkspaceContext (Global State)                  │  │
│  │  └─ API Service (Axios)                              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ REST API
                           │ (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FLASK BACKEND (PORT 5000)                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Blueprints)                             │  │
│  │  ├─ /api/workspaces                                  │  │
│  │  ├─ /api/documents                                   │  │
│  │  └─ /api/llm-streams                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│              │                          │                    │
│              │                          │                    │
│  ┌───────────▼─────────┐   ┌───────────▼────────────────┐  │
│  │  Database Manager   │   │   Services                 │  │
│  │  - Connection Pool  │   │   - LLMService (GPT-4)     │  │
│  │  - Query Builder    │   │   - DocumentProcessor      │  │
│  │  - Schema Manager   │   │     • PDF (PyPDF2)         │  │
│  └──────────┬──────────┘   │     • DOCX (python-docx)   │  │
│             │               │     • TXT (file reader)    │  │
│             │               └────────────┬───────────────┘  │
│             │                            │                  │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
              ▼                            ▼
    ┌──────────────────┐       ┌──────────────────────┐
    │  SQLite Database │       │   OpenAI API         │
    │                  │       │   (GPT-4)            │
    │  Tables:         │       │                      │
    │  - workspaces    │       │  - Chat Completions  │
    │  - documents     │       │  - Structured Output │
    │  - llm_streams   │       │                      │
    └──────────────────┘       └──────────────────────┘
              │
              ▼
       ┌──────────────┐
       │ File Storage │
       │  ./uploads/  │
       └──────────────┘
```

## Data Flow

### 1. Create Workspace Flow

```
User → WorkspaceForm → API Service → POST /api/workspaces
                                            ↓
                                    Database (INSERT)
                                            ↓
                                    Return workspace object
                                            ↓
User ← WorkspaceList ← Context Update ← Response
```

### 2. Document Upload & Processing Flow

```
User → Upload Modal → Select File → API Service
                                         ↓
                              POST /api/documents/upload
                                         ↓
                              - Validate file type/size
                              - Generate UUID
                              - Save to ./uploads/
                              - Insert to documents table
                                         ↓
                              POST /api/documents/:id/process
                                         ↓
                              ┌─────────┴─────────┐
                              ▼                   ▼
                    DocumentProcessor      Database (UPDATE)
                    - Extract text         - Status: processing
                              ↓
                         LLMService
                    - Build prompt
                    - Call GPT-4
                    - Parse JSON
                              ↓
                    Database (INSERT llm_streams)
                    Database (UPDATE documents)
                              ↓
                    Return extracted data
                              ↓
User ← SoWViewer ← Context Update ← Response
```

### 3. View SoW Flow

```
User → Click "View" → Context (loadSowData)
                            ↓
              GET /api/llm-streams/document/:id/latest
                            ↓
                    Database (SELECT)
                            ↓
              Return latest stream with response_payload
                            ↓
User ← SoWViewer ← Parse JSON ← Response
         ├─ ScopeSummary
         ├─ ModulesAndProcesses
         ├─ Stakeholders
         └─ LicenseList
```

## Component Hierarchy

```
App
├─ WorkspaceProvider (Context)
    └─ Layout
        ├─ Header
        ├─ Sidebar
        └─ PageWrapper
            └─ Router/Content
                ├─ WorkspaceList
                │   ├─ WorkspaceCard (multiple)
                │   ├─ WorkspaceForm (Modal)
                │   └─ DocumentUploadModal
                │
                └─ SoWViewer
                    ├─ ScopeSummary
                    ├─ ModulesAndProcesses
                    │   └─ ModuleCard (multiple)
                    ├─ Stakeholders
                    │   └─ BusinessUnit (multiple)
                    │       └─ StakeholderCard (multiple)
                    └─ LicenseList
                        └─ LicenseItem (multiple)
```

## Database Schema Relationships

```
workspaces
    ├─ workspace_id (PK)
    ├─ name
    ├─ project_type
    ├─ licenses (JSON)
    └─ status
         │
         │ 1:N
         ▼
    documents
        ├─ document_id (PK)
        ├─ workspace_id (FK)
        ├─ file_name
        ├─ storage_path
        └─ status
             │
             │ 1:N
             ▼
        llm_streams
            ├─ stream_id (PK)
            ├─ document_id (FK)
            ├─ request_payload
            ├─ response_payload
            ├─ tokens_used
            └─ latency_ms
```

## API Request/Response Examples

### Create Workspace

**Request:**
```http
POST /api/workspaces
Content-Type: application/json

{
  "name": "Acme Corp Implementation",
  "project_type": "Greenfield",
  "licenses": ["Sales Cloud", "Service Cloud"]
}
```

**Response:**
```json
{
  "workspace_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Acme Corp Implementation",
  "project_type": "Greenfield",
  "licenses": ["Sales Cloud", "Service Cloud"],
  "status": "active",
  "created_at": "2025-10-23T10:30:00Z",
  "updated_at": "2025-10-23T10:30:00Z"
}
```

### Upload Document

**Request:**
```http
POST /api/documents/upload?workspace_id=123e4567...
Content-Type: multipart/form-data

file: [binary data]
document_type: "SOW"
```

**Response:**
```json
{
  "document_id": "987e6543-e21b-98d7-a654-426614174111",
  "workspace_id": "123e4567-e89b-12d3-a456-426614174000",
  "document_type": "SOW",
  "file_name": "acme_sow.pdf",
  "storage_path": "./uploads/987e6543-e21b-98d7-a654-426614174111.pdf",
  "status": "uploaded",
  "created_at": "2025-10-23T10:35:00Z"
}
```

### Process Document

**Request:**
```http
POST /api/documents/987e6543.../process
```

**Response:**
```json
{
  "stream_id": "456e7890-e12c-34d5-b678-426614174222",
  "document_id": "987e6543-e21b-98d7-a654-426614174111",
  "response_payload": "{\"scope_summary\": {...}, \"modules\": [...]}",
  "tokens_used": 2500,
  "latency_ms": 3500,
  "status": "success",
  "created_at": "2025-10-23T10:36:00Z"
}
```

## Security Considerations

### Current Implementation
- ✅ File type validation
- ✅ File size limits (10MB)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Soft deletes (data preservation)

### Production Recommendations
1. Add JWT-based authentication
2. Implement rate limiting
3. Add request validation middleware
4. Use HTTPS only
5. Implement file scanning for malware
6. Add audit logging
7. Implement role-based access control
8. Add API key rotation
9. Database encryption at rest
10. Regular security audits

## Performance Considerations

### Frontend
- React.memo for expensive components
- Lazy loading for routes
- Code splitting
- Image optimization
- Minification and bundling

### Backend
- Database connection pooling
- Query optimization
- Caching layer (Redis recommended)
- Async processing for LLM calls
- CDN for static assets
- Load balancing for multiple instances

## Scalability

### Current Limits
- SQLite: Suitable for <100K records
- Single server: ~100 concurrent users
- File storage: Local disk

### Scaling Recommendations
1. **Database**: Migrate to PostgreSQL
2. **File Storage**: Use S3 or similar
3. **Caching**: Add Redis
4. **Queue**: Add Celery for async tasks
5. **Load Balancer**: Nginx or AWS ELB
6. **Monitoring**: Add APM (New Relic, DataDog)
7. **Logging**: Centralized logging (ELK stack)

## Technology Choices Rationale

| Technology | Reason |
|------------|--------|
| React | Modern, component-based, large ecosystem |
| Flask | Lightweight, flexible, Python ecosystem |
| SQLite | Simple, embedded, no separate server needed |
| OpenAI GPT-4 | Best-in-class LLM, structured outputs |
| Material Design 3 | Modern, accessible, consistent |
| Axios | Promise-based, interceptors, wide adoption |
| Context API | Built-in state management, no extra deps |
| PyPDF2 | Mature, reliable PDF parsing |
| python-docx | Official Word document library |

## Deployment Architecture (Recommended)

```
                    ┌─────────────┐
                    │   CloudFlare │
                    │   (CDN/WAF)  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │  Web App  │  │  Web App  │  │  Web App  │
    │  (React)  │  │  (React)  │  │  (React)  │
    └───────────┘  └───────────┘  └───────────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼───────┐
                    │ API Gateway  │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │  Backend  │  │  Backend  │  │  Backend  │
    │  (Flask)  │  │  (Flask)  │  │  (Flask)  │
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │PostgreSQL│  │  Redis   │  │    S3    │
    │ (Primary)│  │ (Cache)  │  │  (Files) │
    └──────────┘  └──────────┘  └──────────┘
          │
          ▼
    ┌──────────┐
    │PostgreSQL│
    │(Replica) │
    └──────────┘
```

This architecture ensures high availability, scalability, and performance for production workloads.

