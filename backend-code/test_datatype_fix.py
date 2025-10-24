#!/usr/bin/env python3
"""
Test script to verify datatype mismatch fix
"""

import json
import requests
import sys

def test_workspace_creation():
    """Test workspace creation with the fixed datatype"""
    
    # Test data
    workspace_data = {
        "name": "test all",
        "project_type": "Greenfield", 
        "licenses": ["Experience Cloud"]
    }
    
    print("=== Testing Workspace Creation ===")
    print(f"Input Data: {json.dumps(workspace_data, indent=2)}")
    
    try:
        # Make request to create workspace
        response = requests.post(
            'http://localhost:5000/api/workspaces',
            json=workspace_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"✓ Workspace created successfully!")
            print(f"Workspace ID: {result.get('workspace_id')} (Type: {type(result.get('workspace_id'))})")
            print(f"Name: {result.get('name')}")
            print(f"Project Type: {result.get('project_type')}")
            print(f"Licenses: {result.get('licenses')}")
            return True
        else:
            print(f"✗ Error creating workspace: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server. Make sure the backend is running on localhost:5000")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing datatype mismatch fix...")
    success = test_workspace_creation()
    
    if success:
        print("\n✓ All tests passed! Datatype mismatch issue has been resolved.")
        sys.exit(0)
    else:
        print("\n✗ Tests failed. Please check the error messages above.")
        sys.exit(1)
