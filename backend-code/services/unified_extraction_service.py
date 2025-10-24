"""
Unified Extraction Service

This service handles all extraction data in a single unified table,
replacing the need for multiple separate extraction tables.
"""

import json
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any


class UnifiedExtractionService:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    
    def store_unified_extraction(self, meeting_id, workspace_id, org_id, extraction_data, created_by=None):
        """
        Store each extraction data key and sub-item in separate rows.
        If a key contains multiple list items, each list item will be a separate row.
        """

        try:
            print("--------------------------------")
            print("Extracting and flattening data for insertion...")
            print("--------------------------------")

            # Prepare list to store all rows to insert
            rows_to_insert = []

            # Iterate through all top-level keys
            for key, value in extraction_data.items():
                if isinstance(value, list):
                    # Each item in the list becomes its own row
                    for item in value:
                        rows_to_insert.append({
                            "data_key": key,
                            "data_value": json.dumps(item, ensure_ascii=False)
                        })
                else:
                    # For non-list values, store directly
                    rows_to_insert.append({
                        "data_key": key,
                        "data_value": json.dumps(value, ensure_ascii=False)
                    })

            # Insert each row into the database
            columns = [
                'meeting_id', 'workspace_id', 'org_id', 'created_by',
                'type', 'extraction_data', 'extraction_status', 'latest_status'
            ]

            placeholders = ', '.join(['?' for _ in columns])
            query = f'''
                INSERT INTO unified_extractions ({', '.join(columns)})
                VALUES ({placeholders})
            '''

            # Execute batch insert
            for row in rows_to_insert:
                values = [
                    meeting_id, workspace_id, org_id, created_by,
                    row['data_key'], row['data_value'], 'completed', 1
                ]
                self.db_manager.execute_query(query, tuple(values))

            print(f"✅ Successfully stored {len(rows_to_insert)} rows for meeting {meeting_id}")

        except Exception as e:
            print(f"❌ Error storing unified extraction: {str(e)}")
            traceback.print_exc()
            raise

    def get_unified_extraction(self, meeting_id, org_id):
        """
        Retrieve unified extraction data for a meeting
        
        Args:
            meeting_id: ID of the meeting
            org_id: Organization ID
            
        Returns:
            Dictionary containing all extraction data
        """
        try:
            query = '''
                SELECT * FROM unified_extractions
                WHERE meeting_id = ? AND org_id = ? AND status = 'active'
                ORDER BY created_at DESC
            '''
            
            results = self.db_manager.fetch_all(query, (meeting_id, org_id))
            
            if not results:
                return None
            
            # Reconstruct the original extraction data structure
            extraction_data = {}
            metadata = {}
            
            for row in results:
                row_dict = dict(row)
                
                # Store metadata from the first row (they should all be the same)
                if not metadata:
                    metadata = {
                        'id': row_dict.get('id'),
                        'meeting_id': row_dict.get('meeting_id'),
                        'workspace_id': row_dict.get('workspace_id'),
                        'org_id': row_dict.get('org_id'),
                        'extraction_status': row_dict.get('extraction_status'),
                        'status': row_dict.get('status'),
                        'created_at': row_dict.get('created_at'),
                        'updated_at': row_dict.get('updated_at'),
                        'created_by': row_dict.get('created_by'),
                        'updated_by': row_dict.get('updated_by')
                    }
                
                # Reconstruct the original data structure
                data_key = row_dict.get('type')
                data_value = row_dict.get('extraction_data')
                
                if data_key and data_value:
                    try:
                        parsed_value = json.loads(data_value)
                        
                        # If this key already exists, append to it (for list items)
                        if data_key in extraction_data:
                            if isinstance(extraction_data[data_key], list):
                                extraction_data[data_key].append(parsed_value)
                            else:
                                # Convert existing value to list and add new item
                                extraction_data[data_key] = [extraction_data[data_key], parsed_value]
                        else:
                            extraction_data[data_key] = parsed_value
                            
                    except json.JSONDecodeError as e:
                        print(f"Error parsing extraction data JSON for key {data_key}: {str(e)}")
                        continue
            
            # Merge metadata with reconstructed data
            if metadata:
                extraction_data.update(metadata)
            
            return extraction_data
            
        except Exception as e:
            print(f"Error retrieving unified extraction: {str(e)}")
            traceback.print_exc()
            return None

    def get_workspace_extractions(self, workspace_id, org_id):
        """
        Retrieve all unified extractions for a workspace
        
        Args:
            workspace_id: ID of the workspace
            org_id: Organization ID
            
        Returns:
            List of extraction data dictionaries grouped by meeting_id
        """
        try:
            query = '''
                SELECT * FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                ORDER BY meeting_id, created_at DESC
            '''
            
            results = self.db_manager.fetch_all(query, (workspace_id, org_id))
            
            if not results:
                return []
            
            # Group results by meeting_id
            meetings_data = {}
            
            for row in results:
                row_dict = dict(row)
                meeting_id = row_dict.get('meeting_id')
                
                if meeting_id not in meetings_data:
                    meetings_data[meeting_id] = {
                        'metadata': {
                            'meeting_id': meeting_id,
                            'workspace_id': row_dict.get('workspace_id'),
                            'org_id': row_dict.get('org_id'),
                            'extraction_status': row_dict.get('extraction_status'),
                            'status': row_dict.get('status'),
                            'created_at': row_dict.get('created_at'),
                            'updated_at': row_dict.get('updated_at'),
                            'created_by': row_dict.get('created_by'),
                            'updated_by': row_dict.get('updated_by')
                        },
                        'data': {}
                    }
                
                # Reconstruct the original data structure
                data_key = row_dict.get('type')
                data_value = row_dict.get('extraction_data')
                
                if data_key and data_value:
                    try:
                        parsed_value = json.loads(data_value)
                        
                        # If this key already exists, append to it (for list items)
                        if data_key in meetings_data[meeting_id]['data']:
                            if isinstance(meetings_data[meeting_id]['data'][data_key], list):
                                meetings_data[meeting_id]['data'][data_key].append(parsed_value)
                            else:
                                # Convert existing value to list and add new item
                                meetings_data[meeting_id]['data'][data_key] = [
                                    meetings_data[meeting_id]['data'][data_key], 
                                    parsed_value
                                ]
                        else:
                            meetings_data[meeting_id]['data'][data_key] = parsed_value
                            
                    except json.JSONDecodeError as e:
                        print(f"Error parsing extraction data JSON for key {data_key}: {str(e)}")
                        continue
            
            # Convert to list format
            extractions = []
            for meeting_id, meeting_data in meetings_data.items():
                # Merge metadata with data
                extraction_data = {**meeting_data['metadata'], **meeting_data['data']}
                extractions.append(extraction_data)
            
            return extractions
            
        except Exception as e:
            print(f"Error retrieving workspace extractions: {str(e)}")
            traceback.print_exc()
            return []

    def update_extraction_status(self, extraction_id, status, updated_by=None):
        """
        Update the status of an extraction
        
        Args:
            extraction_id: ID of the extraction
            status: New status
            updated_by: User who updated the extraction
        """
        try:
            query = '''
                UPDATE unified_extractions
                SET extraction_status = ?, updated_by = ?, updated_at = ?
                WHERE id = ?
            '''
            
            self.db_manager.execute_query(
                query, 
                (status, updated_by, datetime.now(), extraction_id)
            )
            
        except Exception as e:
            print(f"Error updating extraction status: {str(e)}")
            traceback.print_exc()
            raise

    def delete_extraction(self, extraction_id, org_id):
        """
        Soft delete an extraction
        
        Args:
            extraction_id: ID of the extraction
            org_id: Organization ID
        """
        try:
            query = '''
                UPDATE unified_extractions
                SET status = 'deleted', updated_at = ?
                WHERE id = ? AND org_id = ?
            '''
            
            self.db_manager.execute_query(
                query, 
                (datetime.now(), extraction_id, org_id)
            )
            
        except Exception as e:
            print(f"Error deleting extraction: {str(e)}")
            traceback.print_exc()
            raise

    def _count_total_extracted_items(self, extraction_data):
        """Count total number of items extracted across all categories"""
        total = 0
        categories = [
            'bu_teams', 'modules_processes', 'licenses', 'personas',
            'requirements', 'risks_issues', 'action_items', 'decisions',
            'dependencies', 'pain_points', 'current_state', 'target_state',
            'integrations', 'data_migration', 'data_model', 'metadata_updates',
            'scope_summary', 'assumptions_gaps', 'source_references'
        ]
        
        for category in categories:
            if category in extraction_data and isinstance(extraction_data[category], list):
                total += len(extraction_data[category])
        
        return total

    def get_extraction_statistics(self, workspace_id, org_id):
        """
        Get statistics about extractions for a workspace
        
        Args:
            workspace_id: ID of the workspace
            org_id: Organization ID
            
        Returns:
            Dictionary with extraction statistics
        """
        try:
            query = '''
                SELECT 
                    COUNT(*) as total_extractions,
                    SUM(total_items_extracted) as total_items,
                    AVG(processing_time_ms) as avg_processing_time,
                    COUNT(CASE WHEN extraction_status = 'completed' THEN 1 END) as completed_extractions,
                    COUNT(CASE WHEN extraction_status = 'failed' THEN 1 END) as failed_extractions
                FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            '''
            
            result = self.db_manager.fetch_one(query, (workspace_id, org_id))
            
            if result:
                return dict(result)
            else:
                return {
                    'total_extractions': 0,
                    'total_items': 0,
                    'avg_processing_time': 0,
                    'completed_extractions': 0,
                    'failed_extractions': 0
                }
                
        except Exception as e:
            print(f"Error getting extraction statistics: {str(e)}")
            traceback.print_exc()
            return {
                'total_extractions': 0,
                'total_items': 0,
                'avg_processing_time': 0,
                'completed_extractions': 0,
                'failed_extractions': 0
            }
