#!/usr/bin/env python3
"""
Migration script to handle old files that don't have content stored in database
"""

import os
import sys
from datetime import datetime

# Add the backend-code directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager

def check_old_files():
    """Check for old files that need migration"""
    print("=" * 60)
    print("CHECKING FOR OLD FILES THAT NEED MIGRATION")
    print("=" * 60)
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Find files with metadata_only storage_path
    old_files = db.fetch_all(
        "SELECT * FROM files WHERE storage_path = ? AND file_content IS NULL",
        ('metadata_only',)
    )
    
    if old_files:
        print(f"Found {len(old_files)} old files that need migration:")
        for file in old_files:
            print(f"  - File ID {file['file_id']}: {file['file_name']} (workspace_id: {file['workspace_id']})")
        
        print("\nThese files were uploaded before the new storage system was implemented.")
        print("They cannot be processed because their content is not stored in the database.")
        print("\nOptions:")
        print("1. Delete these old files and re-upload them")
        print("2. Mark them as 'legacy' and exclude from processing")
        print("3. Try to find the original files in the uploads directory")
        
        return old_files
    else:
        print("No old files found that need migration.")
        return []

def check_uploads_directory():
    """Check if original files exist in uploads directory"""
    print("\n" + "=" * 60)
    print("CHECKING UPLOADS DIRECTORY")
    print("=" * 60)
    
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    
    if os.path.exists(uploads_dir):
        files = os.listdir(uploads_dir)
        print(f"Found {len(files)} files in uploads directory:")
        for file in files:
            print(f"  - {file}")
    else:
        print("Uploads directory does not exist")

def suggest_solution():
    """Suggest a solution for handling old files"""
    print("\n" + "=" * 60)
    print("RECOMMENDED SOLUTION")
    print("=" * 60)
    
    print("Since the old files don't have content stored in the database,")
    print("the best approach is to:")
    print("\n1. Mark old files as 'legacy' status")
    print("2. Update the document processing logic to handle legacy files gracefully")
    print("3. Provide a clear error message for legacy files")
    print("4. Encourage users to re-upload files for processing")

def mark_legacy_files():
    """Mark old files as legacy"""
    print("\n" + "=" * 60)
    print("MARKING OLD FILES AS LEGACY")
    print("=" * 60)
    
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db = DatabaseManager(db_path)
    
    # Update old files to legacy status
    result = db.execute_query(
        "UPDATE files SET status = ?, updated_at = ? WHERE storage_path = ? AND file_content IS NULL",
        ('legacy', datetime.utcnow(), 'metadata_only')
    )
    
    print(f"Updated {result} files to legacy status")
    
    # Also update corresponding documents
    result = db.execute_query(
        "UPDATE documents SET status = ?, updated_at = ? WHERE storage_path = ?",
        ('legacy', datetime.utcnow(), 'metadata_only')
    )
    
    print(f"Updated {result} documents to legacy status")

if __name__ == "__main__":
    old_files = check_old_files()
    check_uploads_directory()
    
    if old_files:
        suggest_solution()
        
        # Automatically mark as legacy since this is a migration script
        mark_legacy_files()
        print("\n✅ Old files marked as legacy")
    else:
        print("\n✅ No migration needed")
