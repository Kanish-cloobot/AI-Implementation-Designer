#!/usr/bin/env python3
"""
Run the migration to mark old files as legacy
"""

import os
import sys
from datetime import datetime

# Add the backend-code directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager

def mark_legacy_files():
    """Mark old files as legacy"""
    print("Marking old files as legacy...")
    
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
    print("Migration completed successfully")

if __name__ == "__main__":
    mark_legacy_files()
