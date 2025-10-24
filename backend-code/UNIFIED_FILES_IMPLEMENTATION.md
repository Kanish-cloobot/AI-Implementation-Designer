# Unified Files System Implementation

## Overview
This document describes the implementation of a unified file storage system that classifies files by type (workspace/meetings) and properly references workspace_id instances.

## Changes Made

### 1. Database Schema Updates

#### New Unified Files Table
```sql
CREATE TABLE IF NOT EXISTS files (
    file_id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    file_type TEXT NOT NULL,  -- 'workspace' or 'meetings'
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_extension TEXT,
    file_size INTEGER,
    status TEXT DEFAULT 'uploaded',
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id)
);
```

#### Indexes Added
```sql
CREATE INDEX IF NOT EXISTS idx_files_workspace_type 
ON files(workspace_id, file_type);

CREATE INDEX IF NOT EXISTS idx_files_status 
ON files(status);
```

### 2. Route Updates

#### Document Routes (`routes/document_routes.py`)
- **Updated**: `/documents/upload` now inserts into both `files` and `documents` tables
- **Added**: `/files/get-by-workspace` endpoint for querying files by workspace and type
- **File Type**: Workspace files are stored with `file_type = 'workspace'`

#### Meeting Routes (`routes/meeting_routes.py`)
- **Updated**: Meeting file uploads now insert into both `files` and `meeting_files` tables
- **Added**: `/files/get-by-workspace` endpoint for querying meeting files
- **File Type**: Meeting files are stored with `file_type = 'meetings'`

#### Workspace Routes (`routes/workspace_routes.py`)
- **Added**: `/files/get-by-workspace` endpoint for querying files by workspace and type

### 3. Key Features

#### File Type Classification
- **Workspace Files**: `file_type = 'workspace'` for documents uploaded to workspaces
- **Meeting Files**: `file_type = 'meetings'` for files uploaded to meetings

#### Proper Workspace ID References
- All files now properly reference `workspace_id` as table instances (not string UUIDs)
- Foreign key constraints ensure data integrity
- Queries filter by `workspace_id` and `status` for proper data isolation

#### Backward Compatibility
- Existing `documents` and `meeting_files` tables are maintained
- New unified `files` table works alongside existing tables
- No breaking changes to existing functionality

### 4. API Endpoints

#### New Endpoints
- `POST /files/get-by-workspace` - Get files by workspace and optional type
- `POST /files/get-by-workspace` (meeting routes) - Get meeting files by workspace

#### Request Format
```json
{
    "workspace_id": "uuid-string",
    "file_type": "workspace" | "meetings" (optional)
}
```

#### Response Format
```json
[
    {
        "file_id": "uuid-string",
        "workspace_id": "uuid-string",
        "file_type": "workspace" | "meetings",
        "file_name": "filename.ext",
        "storage_path": "/path/to/file",
        "file_extension": ".ext",
        "file_size": 1024,
        "status": "uploaded",
        "created_at": "timestamp",
        "updated_at": "timestamp"
    }
]
```

### 5. Database Query Examples

#### Get All Files for a Workspace
```sql
SELECT * FROM files 
WHERE workspace_id = ? AND status != 'deleted'
ORDER BY created_at DESC;
```

#### Get Workspace Files Only
```sql
SELECT * FROM files 
WHERE workspace_id = ? AND file_type = 'workspace' AND status != 'deleted'
ORDER BY created_at DESC;
```

#### Get Meeting Files Only
```sql
SELECT * FROM files 
WHERE workspace_id = ? AND file_type = 'meetings' AND status != 'deleted'
ORDER BY created_at DESC;
```

### 6. Benefits

1. **Unified Storage**: Single table for all file types with proper classification
2. **Type Safety**: Clear distinction between workspace and meeting files
3. **Data Integrity**: Proper foreign key relationships with workspaces
4. **Performance**: Optimized indexes for common query patterns
5. **Flexibility**: Easy to extend with new file types in the future
6. **Backward Compatibility**: Existing functionality remains unchanged

### 7. Testing

A comprehensive test script (`test_unified_files.py`) has been created to verify:
- File creation with proper type classification
- Workspace ID reference integrity
- Query functionality for different file types
- Database constraint validation

### 8. Migration Notes

- No data migration required - new table is created alongside existing tables
- Existing file uploads will now populate both old and new tables
- Gradual migration possible - old tables can be deprecated over time
- All new file operations use the unified system

## Usage Examples

### Upload Workspace Document
```python
# File is automatically classified as 'workspace' type
# Stored in both 'files' and 'documents' tables
POST /documents/upload
```

### Upload Meeting File
```python
# File is automatically classified as 'meetings' type
# Stored in both 'files' and 'meeting_files' tables
POST /meetings (with file upload)
```

### Query Files by Type
```python
# Get all workspace files
POST /files/get-by-workspace
{
    "workspace_id": "uuid",
    "file_type": "workspace"
}

# Get all meeting files
POST /files/get-by-workspace
{
    "workspace_id": "uuid", 
    "file_type": "meetings"
}
```

This implementation provides a robust, scalable file storage system that properly classifies files and maintains data integrity through proper workspace ID references.
