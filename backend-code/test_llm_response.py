#!/usr/bin/env python3
"""
Test script to check what the LLM is actually returning for extraction
"""

import json
import sys
import os
from database.db_manager import DatabaseManager
from services.meeting_extraction_service import MeetingExtractionService

def test_llm_response():
    """Test what the LLM is actually returning"""
    
    # Initialize database connection
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'ids.db')
    db_manager = DatabaseManager(db_path)
    
    print("=== LLM Response Analysis ===")
    print(f"Database path: {db_path}")
    print()
    
    # Get a recent meeting with files
    meeting = db_manager.fetch_one(
        "SELECT meeting_id, workspace_id, org_id FROM meetings WHERE status = 'scheduled' ORDER BY created_at DESC LIMIT 1"
    )
    
    if not meeting:
        print("No meetings found")
        return
    
    meeting_id = meeting['meeting_id']
    workspace_id = meeting['workspace_id']
    org_id = meeting['org_id']
    
    print(f"Analyzing Meeting {meeting_id} in Workspace {workspace_id}")
    
    # Get meeting files
    files = db_manager.fetch_all(
        "SELECT * FROM meeting_files WHERE meeting_id = ? AND org_id = ? AND status = 'uploaded'",
        (meeting_id, org_id)
    )
    
    print(f"Found {len(files)} files")
    
    if not files:
        print("No files found for this meeting")
        return
    
    # Test extraction on the first file
    file_path = files[0]['storage_path']
    print(f"Testing extraction on file: {file_path}")
    
    # Initialize extraction service
    extraction_service = MeetingExtractionService(db_manager)
    
    # Read file content using document processor
    try:
        from services.document_processor import DocumentProcessor
        doc_processor = DocumentProcessor()
        file_content = doc_processor.extract_text(file_path)
        
        if not file_content:
            print("No content extracted from file")
            return
            
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return
    
    print(f"File content length: {len(file_content)} characters")
    print(f"First 200 characters: {file_content[:200]}...")
    print()
    
    # Test LLM extraction
    print("=== Testing LLM Extraction ===")
    try:
        # Call the LLM directly
        llm_response = extraction_service._call_llm_for_extraction(file_content)
        
        if llm_response:
            print("LLM Response received!")
            print(f"Response length: {len(llm_response)} characters")
            print(f"First 500 characters: {llm_response[:500]}...")
            print()
            
            # Try to parse the JSON
            try:
                parsed_data = json.loads(llm_response)
                print("=== Parsed JSON Structure ===")
                print(f"Top-level keys: {list(parsed_data.keys())}")
                
                # Check each extraction type
                extraction_types = [
                    'document_metadata', 'V1_list_of_bu_teams', 'V2_modules_and_processes',
                    'V3_license_list', 'V4_personas', 'V5_requirements', 'V6_risks_and_issues',
                    'V7_action_items', 'V8_decisions', 'V9_dependencies', 'V10_pain_points',
                    'V11_current_state_as_is', 'V12_target_state_to_be', 'V13_applications_to_be_integrated',
                    'V14_data_migration', 'V15_data_model', 'V16_metadata_to_update',
                    'scope_summary', 'assumptions_and_gaps', 'source_references', 'validation_summary'
                ]
                
                print("\n=== Extraction Type Analysis ===")
                for extraction_type in extraction_types:
                    if extraction_type in parsed_data:
                        data = parsed_data[extraction_type]
                        if isinstance(data, list):
                            print(f"[FOUND] {extraction_type}: {len(data)} items")
                            if len(data) > 0:
                                print(f"  Sample: {json.dumps(data[0], indent=2)[:200]}...")
                        else:
                            print(f"[FOUND] {extraction_type}: {type(data)} (not a list)")
                    else:
                        print(f"[MISSING] {extraction_type}: Not in response")
                
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {str(e)}")
                print("Raw response:")
                print(llm_response)
        else:
            print("No LLM response received")
            
    except Exception as e:
        print(f"Error calling LLM: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_llm_response()
