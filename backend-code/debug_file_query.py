#!/usr/bin/env python3
"""
Debug script to check file content in database and fix query issues
"""

import os
import sys
from datetime import datetime

# Add the backend-code directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager

def debug_database_contents():
    """Debug what's actually in the database"""
    print("=" * 60)
    print("DEBUGGING DATABASE CONTENTS")
    print("=" * 60)
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Check files table structure
    print("\n1. Files table structure:")
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(files)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"   {col[1]} ({col[2]})")
    conn.close()
    
    # Check all files in database
    print("\n2. All files in database:")
    files = db.fetch_all("SELECT * FROM files")
    if files:
        for file in files:
            print(f"   File ID: {file['file_id']}")
            print(f"   Workspace ID: {file['workspace_id']}")
            print(f"   File Name: {file['file_name']}")
            print(f"   File Type: {file['file_type']}")
            print(f"   Storage Path: {file['storage_path']}")
            print(f"   File Extension: {file['file_extension']}")
            print(f"   File Size: {file['file_size']}")
            print(f"   Status: {file['status']}")
            print(f"   Has Content: {'Yes' if file['file_content'] else 'No'}")
            print(f"   Content Length: {len(file['file_content']) if file['file_content'] else 0}")
            print("   " + "-" * 40)
    else:
        print("   No files found in database")
    
    # Check documents table
    print("\n3. All documents in database:")
    documents = db.fetch_all("SELECT * FROM documents")
    if documents:
        for doc in documents:
            print(f"   Document ID: {doc['document_id']}")
            print(f"   Workspace ID: {doc['workspace_id']}")
            print(f"   File Name: {doc['file_name']}")
            print(f"   Storage Path: {doc['storage_path']}")
            print(f"   Status: {doc['status']}")
            print("   " + "-" * 40)
    else:
        print("   No documents found in database")
    
    # Check workspaces
    print("\n4. All workspaces in database:")
    workspaces = db.fetch_all("SELECT * FROM workspaces")
    if workspaces:
        for workspace in workspaces:
            print(f"   Workspace ID: {workspace['workspace_id']}")
            print(f"   Name: {workspace['name']}")
            print(f"   Status: {workspace['status']}")
            print("   " + "-" * 40)
    else:
        print("   No workspaces found in database")

def test_file_query_logic():
    """Test the current file query logic"""
    print("\n" + "=" * 60)
    print("TESTING FILE QUERY LOGIC")
    print("=" * 60)
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Get a sample document
    documents = db.fetch_all("SELECT * FROM documents LIMIT 1")
    if not documents:
        print("No documents found to test with")
        return
    
    document = documents[0]
    print(f"Testing with document: {document['file_name']} (workspace_id: {document['workspace_id']})")
    
    # Test current query
    print("\n1. Testing current query:")
    file_record = db.fetch_one(
        '''SELECT file_content, file_extension FROM files 
           WHERE workspace_id = ? AND file_name = ? AND status != ?''',
        (document['workspace_id'], document['file_name'], 'deleted')
    )
    
    if file_record:
        print(f"   ✓ Found file record")
        print(f"   File extension: {file_record['file_extension']}")
        print(f"   Has content: {'Yes' if file_record['file_content'] else 'No'}")
        if file_record['file_content']:
            print(f"   Content length: {len(file_record['file_content'])}")
    else:
        print("   ✗ No file record found with current query")
        
        # Try alternative queries
        print("\n2. Trying alternative queries:")
        
        # Query by file_name only
        file_record = db.fetch_one(
            "SELECT file_content, file_extension FROM files WHERE file_name = ?",
            (document['file_name'],)
        )
        if file_record:
            print("   ✓ Found by file_name only")
        else:
            print("   ✗ Not found by file_name only")
        
        # Query by workspace_id only
        files = db.fetch_all(
            "SELECT file_content, file_extension, file_name FROM files WHERE workspace_id = ?",
            (document['workspace_id'],)
        )
        if files:
            print(f"   ✓ Found {len(files)} files by workspace_id")
            for f in files:
                print(f"     - {f['file_name']} (has content: {'Yes' if f['file_content'] else 'No'})")
        else:
            print("   ✗ No files found by workspace_id")

def suggest_fix():
    """Suggest a fix for the query issue"""
    print("\n" + "=" * 60)
    print("SUGGESTED FIX")
    print("=" * 60)
    
    print("The issue is likely one of these:")
    print("1. The file_name in documents table doesn't match the file_name in files table")
    print("2. The workspace_id doesn't match")
    print("3. The file was stored but the query conditions are too restrictive")
    print("\nSuggested fix:")
    print("- Use a more flexible query that tries multiple approaches")
    print("- Add better error logging to see what's actually in the database")
    print("- Consider using file_id instead of file_name for more reliable matching")

if __name__ == "__main__":
    debug_database_contents()
    test_file_query_logic()
    suggest_fix()
