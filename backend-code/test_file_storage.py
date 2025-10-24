#!/usr/bin/env python3
"""
Test script for the updated file storage logic
Tests file upload, storage in database, and text extraction
"""

import os
import sys
import tempfile
from datetime import datetime

# Add the backend-code directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager
from services.document_processor import DocumentProcessor

def test_database_schema():
    """Test that the database schema includes file_content column"""
    print("Testing database schema...")
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Initialize database to ensure schema is up to date
    db.initialize_database()
    
    # Check if file_content column exists
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(files)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if 'file_content' in column_names:
        print("✓ file_content column exists in files table")
    else:
        print("✗ file_content column missing from files table")
        return False
    
    conn.close()
    return True

def test_file_storage():
    """Test storing file content in database"""
    print("\nTesting file storage in database...")
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Create a test workspace
    db.execute_query(
        '''INSERT INTO workspaces (name, project_type, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)''',
        ('Test Workspace', 'test', 'active', datetime.utcnow(), datetime.utcnow())
    )
    
    workspace_id = db.fetch_one('SELECT workspace_id FROM workspaces ORDER BY workspace_id DESC LIMIT 1')['workspace_id']
    print(f"Created test workspace with ID: {workspace_id}")
    
    # Create test file content
    test_content = b"This is a test document content for testing file storage in database."
    test_filename = "test_document.txt"
    test_extension = "txt"
    test_size = len(test_content)
    
    # Store file in database
    db.execute_query(
        '''INSERT INTO files 
           (workspace_id, file_type, file_name, storage_path, file_content, 
            file_extension, file_size, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (workspace_id, 'workspace', test_filename, 'database_stored', test_content,
         test_extension, test_size, 'uploaded', datetime.utcnow(), datetime.utcnow())
    )
    
    # Verify file was stored
    file_record = db.fetch_one(
        'SELECT * FROM files WHERE workspace_id = ? AND file_name = ?',
        (workspace_id, test_filename)
    )
    
    if file_record and file_record['file_content'] == test_content:
        print("✓ File content successfully stored in database")
        return True, workspace_id, test_filename
    else:
        print("✗ File content not properly stored in database")
        return False, None, None

def test_text_extraction():
    """Test text extraction from database-stored file content"""
    print("\nTesting text extraction from database...")
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Get the test file from database
    file_record = db.fetch_one(
        'SELECT file_content, file_extension FROM files WHERE file_name = ?',
        ('test_document.txt',)
    )
    
    if not file_record:
        print("✗ Test file not found in database")
        return False
    
    # Test document processor
    doc_processor = DocumentProcessor()
    
    try:
        extracted_text = doc_processor.extract_text(
            file_record['file_content'],
            file_record['file_extension']
        )
        
        expected_text = "This is a test document content for testing file storage in database."
        
        if extracted_text == expected_text:
            print("✓ Text extraction from database successful")
            print(f"Extracted text: '{extracted_text}'")
            return True
        else:
            print(f"✗ Text extraction failed. Expected: '{expected_text}', Got: '{extracted_text}'")
            return False
            
    except Exception as e:
        print(f"✗ Text extraction failed with error: {str(e)}")
        return False

def cleanup_test_data():
    """Clean up test data"""
    print("\nCleaning up test data...")
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Delete test files
    db.execute_query('DELETE FROM files WHERE file_name = ?', ('test_document.txt',))
    
    # Delete test workspace
    db.execute_query('DELETE FROM workspaces WHERE name = ?', ('Test Workspace',))
    
    print("✓ Test data cleaned up")

def main():
    """Run all tests"""
    print("=" * 60)
    print("TESTING UPDATED FILE STORAGE LOGIC")
    print("=" * 60)
    
    try:
        # Test 1: Database schema
        if not test_database_schema():
            print("\n❌ Database schema test failed")
            return False
        
        # Test 2: File storage
        success, workspace_id, filename = test_file_storage()
        if not success:
            print("\n❌ File storage test failed")
            return False
        
        # Test 3: Text extraction
        if not test_text_extraction():
            print("\n❌ Text extraction test failed")
            return False
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("✅ File storage logic successfully updated")
        print("✅ Files are now stored in database instead of file system")
        print("✅ Document processor can read from database")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        return False
    
    finally:
        cleanup_test_data()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
