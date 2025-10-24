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
        Store all extraction data in a single unified table row
        
        Args:
            meeting_id: ID of the meeting
            workspace_id: ID of the workspace
            org_id: Organization ID
            extraction_data: Dictionary containing all extraction data
            created_by: User who created the extraction
        """
        try:
            # Calculate total items extracted
            total_items = self._count_total_extracted_items(extraction_data)
            
            # Store all extraction data as JSON in a single column
            columns = [
                'meeting_id', 'workspace_id', 'org_id', 'created_by',
                'extraction_data', 'total_items_extracted', 'extraction_status'
            ]
            
            values = [
                meeting_id, workspace_id, org_id, created_by,
                json.dumps(extraction_data),
                total_items,
                'completed'
            ]
            
            placeholders = ', '.join(['?' for _ in values])
            query = f'''
                INSERT INTO unified_extractions ({', '.join(columns)})
                VALUES ({placeholders})
            '''
            
            self.db_manager.execute_query(query, tuple(values))
            print(f"Successfully stored unified extraction for meeting {meeting_id}")
            
        except Exception as e:
            print(f"Error storing unified extraction: {str(e)}")
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
                LIMIT 1
            '''
            
            result = self.db_manager.fetch_one(query, (meeting_id, org_id))
            
            if not result:
                return None
                
            # Parse the JSON extraction data
            extraction_data = dict(result)
            
            if extraction_data.get('extraction_data'):
                try:
                    # Parse the main extraction data JSON
                    parsed_data = json.loads(extraction_data['extraction_data'])
                    # Merge with metadata
                    extraction_data.update(parsed_data)
                except json.JSONDecodeError as e:
                    print(f"Error parsing extraction data JSON: {str(e)}")
                    extraction_data['extraction_data'] = {}
            
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
            List of extraction data dictionaries
        """
        try:
            query = '''
                SELECT * FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                ORDER BY created_at DESC
            '''
            
            results = self.db_manager.fetch_all(query, (workspace_id, org_id))
            
            extractions = []
            for result in results:
                extraction_data = dict(result)
                
                # Parse the JSON extraction data
                if extraction_data.get('extraction_data'):
                    try:
                        # Parse the main extraction data JSON
                        parsed_data = json.loads(extraction_data['extraction_data'])
                        # Merge with metadata
                        extraction_data.update(parsed_data)
                    except json.JSONDecodeError as e:
                        print(f"Error parsing extraction data JSON: {str(e)}")
                        extraction_data['extraction_data'] = {}
                
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
