#!/usr/bin/env python3
"""
Test script for meeting LLM streams functionality
"""

import sys
import os
import json
from datetime import datetime

# Add the backend-code directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db_manager import DatabaseManager

def test_meeting_llm_streams():
    """Test the meeting LLM streams table and methods"""
    
    # Initialize database manager
    db_manager = DatabaseManager('database/ids.db')
    
    # Initialize database (creates tables if they don't exist)
    db_manager.initialize_database()
    
    print("=== Testing Meeting LLM Streams ===")
    
    # Test data
    meeting_id = 1
    workspace_id = 1
    org_id = "test_org_123"
    
    # Sample GPT messages array (same format for both llm_streams and meeting_llm_streams)
    sample_messages = [
        {
            "role": "system",
            "content": "You are an expert analyst for Salesforce implementation discovery, design, and build."
        },
        {
            "role": "user", 
            "content": "Analyze the following meeting transcript and extract structured information for implementation discovery."
        }
    ]
    
    # Sample response content (what LLM returns)
    sample_response_content = "Based on the meeting transcript, I have extracted the following information..."
    
    try:
        # Test 1: Insert a new LLM stream
        print("\n1. Testing insert_meeting_llm_stream...")
        stream_id = db_manager.insert_meeting_llm_stream(
            meeting_id=meeting_id,
            workspace_id=workspace_id,
            org_id=org_id,
            request_payload=json.dumps(sample_messages),
            model_name="gpt-4",
            temperature=0.7,
            max_tokens=2000,
            created_by="test_user"
        )
        print(f"✓ Inserted LLM stream with ID: {stream_id}")
        
        # Test 2: Update with response
        print("\n2. Testing update_meeting_llm_stream_response...")
        db_manager.update_meeting_llm_stream_response(
            stream_id=stream_id,
            response_payload=sample_response_content,
            tokens_used=150,
            latency_ms=2500,
            processing_status='completed'
        )
        print("✓ Updated LLM stream with response data")
        
        # Test 3: Retrieve LLM stream by ID
        print("\n3. Testing get_meeting_llm_stream_by_id...")
        stream = db_manager.get_meeting_llm_stream_by_id(stream_id, org_id)
        if stream:
            print(f"✓ Retrieved stream: ID={stream['stream_id']}, Status={stream['processing_status']}")
            print(f"  Request: {stream['request_payload'][:100]}...")
            print(f"  Response: {stream['response_payload'][:100]}...")
        else:
            print("✗ Failed to retrieve stream")
        
        # Test 4: Get all streams for meeting
        print("\n4. Testing get_meeting_llm_streams...")
        streams = db_manager.get_meeting_llm_streams(meeting_id, org_id)
        print(f"✓ Found {len(streams)} streams for meeting {meeting_id}")
        
        # Test 5: Get pending streams
        print("\n5. Testing get_pending_meeting_llm_streams...")
        pending_streams = db_manager.get_pending_meeting_llm_streams(org_id)
        print(f"✓ Found {len(pending_streams)} pending streams")
        
        # Test 6: Verify data integrity
        print("\n6. Testing data integrity...")
        if stream:
            # Parse stored data
            stored_messages = json.loads(stream['request_payload'])
            stored_response = stream['response_payload']
            
            # Verify messages match
            if stored_messages == sample_messages:
                print("✓ Request messages match original data")
            else:
                print("✗ Request messages don't match")
                
            # Verify response data
            if stored_response == sample_response_content:
                print("✓ Response content matches original data")
            else:
                print("✗ Response content doesn't match")
                
            # Verify metadata
            if stream['tokens_used'] == 150 and stream['latency_ms'] == 2500:
                print("✓ Metadata (tokens, latency) stored correctly")
            else:
                print("✗ Metadata not stored correctly")
        
        print("\n=== All Tests Completed Successfully ===")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_meeting_llm_streams()
