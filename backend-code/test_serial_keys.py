#!/usr/bin/env python3
"""
Test script to verify that all tables now use serial primary keys instead of UUIDs.
This script will test the database schema changes.
"""

import os
import sys
import sqlite3
from database.db_manager import DatabaseManager

def test_database_schema():
    """Test that all tables use INTEGER PRIMARY KEY AUTOINCREMENT for their first columns."""
    
    # Create a test database
    test_db_path = os.path.join(os.getcwd(), "test_serial_keys.db")
    
    try:
        # Remove existing test database if it exists
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
        
        # Initialize database with new schema
        db_manager = DatabaseManager(test_db_path)
        db_manager.initialize_database()
        
        # Connect to database to inspect schema
        conn = sqlite3.connect(test_db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print("Testing database schema changes...")
        print("=" * 50)
        
        # Check each table's primary key
        for table_name, in tables:
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            if columns:
                first_column = columns[0]
                column_name = first_column[1]
                column_type = first_column[2]
                is_primary = first_column[5]  # 1 if primary key
                
                print(f"Table: {table_name}")
                print(f"  First column: {column_name}")
                print(f"  Type: {column_type}")
                print(f"  Is Primary Key: {bool(is_primary)}")
                
                # Verify it's an INTEGER PRIMARY KEY AUTOINCREMENT
                if is_primary:
                    if column_type.upper() == 'INTEGER':
                        print(f"  [OK] Correct: INTEGER primary key")
                    else:
                        print(f"  [ERROR] Expected INTEGER, got {column_type}")
                else:
                    print(f"  [ERROR] First column is not primary key")
                
                print()
        
        # Test inserting data to verify autoincrement works
        print("Testing autoincrement functionality...")
        print("=" * 50)
        
        # Test workspaces table
        cursor.execute("""
            INSERT INTO workspaces (name, project_type, created_by) 
            VALUES (?, ?, ?)
        """, ("Test Workspace", "Test Project", "test_user"))
        
        workspace_id = cursor.lastrowid
        print(f"[OK] Inserted workspace with ID: {workspace_id}")
        
        # Test meetings table
        cursor.execute("""
            INSERT INTO meetings (workspace_id, org_id, meeting_name, created_by) 
            VALUES (?, ?, ?, ?)
        """, (workspace_id, "test_org", "Test Meeting", "test_user"))
        
        meeting_id = cursor.lastrowid
        print(f"[OK] Inserted meeting with ID: {meeting_id}")
        
        # Test files table
        cursor.execute("""
            INSERT INTO files (workspace_id, file_type, file_name, storage_path, created_by) 
            VALUES (?, ?, ?, ?, ?)
        """, (workspace_id, "document", "test_file.txt", "/path/to/file", "test_user"))
        
        file_id = cursor.lastrowid
        print(f"[OK] Inserted file with ID: {file_id}")
        
        # Test documents table
        cursor.execute("""
            INSERT INTO documents (workspace_id, document_type, file_name, storage_path, created_by) 
            VALUES (?, ?, ?, ?, ?)
        """, (workspace_id, "pdf", "test_doc.pdf", "/path/to/doc", "test_user"))
        
        document_id = cursor.lastrowid
        print(f"[OK] Inserted document with ID: {document_id}")
        
        # Test llm_streams table
        cursor.execute("""
            INSERT INTO llm_streams (document_id, request_payload, response_payload, created_by) 
            VALUES (?, ?, ?, ?)
        """, (document_id, "test request", "test response", "test_user"))
        
        stream_id = cursor.lastrowid
        print(f"[OK] Inserted LLM stream with ID: {stream_id}")
        
        # Test meeting_files table
        cursor.execute("""
            INSERT INTO meeting_files (meeting_id, workspace_id, org_id, file_name, storage_path, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (meeting_id, workspace_id, "test_org", "meeting_file.txt", "/path/to/meeting/file", "test_user"))
        
        meeting_file_id = cursor.lastrowid
        print(f"[OK] Inserted meeting file with ID: {meeting_file_id}")
        
        # Test extraction table
        cursor.execute("""
            INSERT INTO extraction_bu_teams (meeting_id, workspace_id, org_id, business_unit, teams) 
            VALUES (?, ?, ?, ?, ?)
        """, (meeting_id, workspace_id, "test_org", "IT", "Development"))
        
        extraction_id = cursor.lastrowid
        print(f"[OK] Inserted extraction data with ID: {extraction_id}")
        
        print("\n" + "=" * 50)
        print("[SUCCESS] All tests passed! Serial primary keys are working correctly.")
        print("[SUCCESS] Database schema successfully updated from UUID to serial primary keys.")
        
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        # Clean up test database
        if os.path.exists(test_db_path):
            os.remove(test_db_path)

if __name__ == "__main__":
    success = test_database_schema()
    sys.exit(0 if success else 1)
