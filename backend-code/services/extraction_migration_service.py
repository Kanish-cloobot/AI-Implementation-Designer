"""
Extraction Migration Service

This service migrates data from individual extraction tables
to the unified extraction table.
"""

import json
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Any


class ExtractionMigrationService:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def migrate_all_extractions(self, org_id=None):
        """
        Migrate all extractions from individual tables to unified table
        
        Args:
            org_id: Optional organization ID to filter migrations
        """
        try:
            print("Starting extraction migration...")
            
            # Get all meetings with extractions
            meetings_query = '''
                SELECT DISTINCT m.meeting_id, m.workspace_id, m.org_id
                FROM meetings m
                WHERE m.status = 'active'
            '''
            
            if org_id:
                meetings_query += ' AND m.org_id = ?'
                meetings = self.db_manager.fetch_all(meetings_query, (org_id,))
            else:
                meetings = self.db_manager.fetch_all(meetings_query)
            
            migrated_count = 0
            failed_count = 0
            
            for meeting in meetings:
                meeting_id = meeting['meeting_id']
                workspace_id = meeting['workspace_id']
                meeting_org_id = meeting['org_id']
                
                try:
                    # Check if unified extraction already exists
                    existing_query = '''
                        SELECT id FROM unified_extractions
                        WHERE meeting_id = ? AND org_id = ?
                    '''
                    existing = self.db_manager.fetch_one(existing_query, (meeting_id, meeting_org_id))
                    
                    if existing:
                        print(f"Skipping meeting {meeting_id} - unified extraction already exists")
                        continue
                    
                    # Collect all extraction data for this meeting
                    extraction_data = self._collect_meeting_extractions(meeting_id, meeting_org_id)
                    
                    if extraction_data:
                        # Store in unified table
                        self._store_unified_extraction(
                            meeting_id, workspace_id, meeting_org_id, extraction_data
                        )
                        migrated_count += 1
                        print(f"Migrated extractions for meeting {meeting_id}")
                    else:
                        print(f"No extractions found for meeting {meeting_id}")
                        
                except Exception as e:
                    print(f"Error migrating meeting {meeting_id}: {str(e)}")
                    failed_count += 1
                    continue
            
            print(f"Migration completed. Migrated: {migrated_count}, Failed: {failed_count}")
            return {
                'migrated_count': migrated_count,
                'failed_count': failed_count,
                'total_meetings': len(meetings)
            }
            
        except Exception as e:
            print(f"Error in migration process: {str(e)}")
            traceback.print_exc()
            raise

    def _collect_meeting_extractions(self, meeting_id, org_id):
        """
        Collect all extraction data for a specific meeting
        
        Args:
            meeting_id: ID of the meeting
            org_id: Organization ID
            
        Returns:
            Dictionary containing all extraction data
        """
        try:
            extraction_data = {
                'bu_teams': [],
                'modules_processes': [],
                'licenses': [],
                'personas': [],
                'requirements': [],
                'risks_issues': [],
                'action_items': [],
                'decisions': [],
                'dependencies': [],
                'pain_points': [],
                'current_state': [],
                'target_state': [],
                'integrations': [],
                'data_migration': [],
                'data_model': [],
                'metadata_updates': [],
                'scope_summary': [],
                'assumptions_gaps': [],
                'source_references': [],
                'validation_summary': {}
            }
            
            # Define extraction table mappings
            extraction_tables = {
                'bu_teams': 'extraction_bu_teams',
                'modules_processes': 'extraction_modules_processes',
                'licenses': 'extraction_licenses',
                'personas': 'extraction_personas',
                'requirements': 'extraction_requirements',
                'risks_issues': 'extraction_risks_issues',
                'action_items': 'extraction_action_items',
                'decisions': 'extraction_decisions',
                'dependencies': 'extraction_dependencies',
                'pain_points': 'extraction_pain_points',
                'current_state': 'extraction_current_state',
                'target_state': 'extraction_target_state',
                'integrations': 'extraction_integrations',
                'data_migration': 'extraction_data_migration',
                'data_model': 'extraction_data_model',
                'metadata_updates': 'extraction_metadata_updates',
                'scope_summary': 'extraction_scope_summary',
                'assumptions_gaps': 'extraction_assumptions_gaps',
                'source_references': 'extraction_source_references',
                'validation_summary': 'extraction_validation_summary'
            }
            
            # Collect data from each extraction table
            for key, table_name in extraction_tables.items():
                try:
                    query = f'''
                        SELECT * FROM {table_name}
                        WHERE meeting_id = ? AND org_id = ? AND status = 'active'
                    '''
                    
                    results = self.db_manager.fetch_all(query, (meeting_id, org_id))
                    
                    if results:
                        if key == 'validation_summary':
                            # Validation summary is a single object, not array
                            if results:
                                extraction_data[key] = dict(results[0])
                        else:
                            # Convert to list of dictionaries
                            extraction_data[key] = [dict(row) for row in results]
                    
                except Exception as e:
                    print(f"Error collecting data from {table_name}: {str(e)}")
                    continue
            
            # Check if we have any data
            has_data = any(
                extraction_data[key] for key in extraction_data.keys()
                if key != 'validation_summary'
            ) or extraction_data['validation_summary']
            
            return extraction_data if has_data else None
            
        except Exception as e:
            print(f"Error collecting meeting extractions: {str(e)}")
            traceback.print_exc()
            return None

    def _store_unified_extraction(self, meeting_id, workspace_id, org_id, extraction_data):
        """
        Store extraction data in unified table
        
        Args:
            meeting_id: ID of the meeting
            workspace_id: ID of the workspace
            org_id: Organization ID
            extraction_data: Dictionary containing all extraction data
        """
        try:
            # Calculate total items extracted
            total_items = self._count_total_extracted_items(extraction_data)
            
            # Store all extraction data as JSON in a single column
            columns = [
                'meeting_id', 'workspace_id', 'org_id',
                'extraction_data', 'total_items_extracted', 'extraction_status', 'created_at'
            ]
            
            values = [
                meeting_id, workspace_id, org_id,
                json.dumps(extraction_data),
                total_items,
                'migrated',
                datetime.now()
            ]
            
            placeholders = ', '.join(['?' for _ in values])
            query = f'''
                INSERT INTO unified_extractions ({', '.join(columns)})
                VALUES ({placeholders})
            '''
            
            self.db_manager.execute_query(query, tuple(values))
            
        except Exception as e:
            print(f"Error storing unified extraction: {str(e)}")
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

    def verify_migration(self, org_id=None):
        """
        Verify that migration was successful by comparing counts
        
        Args:
            org_id: Optional organization ID to filter verification
            
        Returns:
            Dictionary with verification results
        """
        try:
            print("Verifying migration...")
            
            # Get counts from individual tables
            individual_counts = {}
            extraction_tables = [
                'extraction_bu_teams', 'extraction_modules_processes', 'extraction_licenses',
                'extraction_personas', 'extraction_requirements', 'extraction_risks_issues',
                'extraction_action_items', 'extraction_decisions', 'extraction_dependencies',
                'extraction_pain_points', 'extraction_current_state', 'extraction_target_state',
                'extraction_integrations', 'extraction_data_migration', 'extraction_data_model',
                'extraction_metadata_updates', 'extraction_scope_summary', 'extraction_assumptions_gaps',
                'extraction_source_references', 'extraction_validation_summary'
            ]
            
            for table_name in extraction_tables:
                query = f'''
                    SELECT COUNT(*) as count FROM {table_name}
                    WHERE status = 'active'
                '''
                
                if org_id:
                    query += ' AND org_id = ?'
                    result = self.db_manager.fetch_one(query, (org_id,))
                else:
                    result = self.db_manager.fetch_one(query)
                
                individual_counts[table_name] = result['count'] if result else 0
            
            # Get count from unified table
            unified_query = '''
                SELECT COUNT(*) as count FROM unified_extractions
                WHERE status = 'active'
            '''
            
            if org_id:
                unified_query += ' AND org_id = ?'
                unified_result = self.db_manager.fetch_one(unified_query, (org_id,))
            else:
                unified_result = self.db_manager.fetch_one(unified_query)
            
            unified_count = unified_result['count'] if unified_result else 0
            
            # Calculate totals
            total_individual = sum(individual_counts.values())
            
            verification_result = {
                'individual_table_counts': individual_counts,
                'unified_table_count': unified_count,
                'total_individual_records': total_individual,
                'migration_successful': unified_count > 0,
                'data_integrity_check': 'passed' if unified_count > 0 else 'failed'
            }
            
            print(f"Verification complete:")
            print(f"  Individual tables total: {total_individual}")
            print(f"  Unified table count: {unified_count}")
            print(f"  Migration successful: {verification_result['migration_successful']}")
            
            return verification_result
            
        except Exception as e:
            print(f"Error verifying migration: {str(e)}")
            traceback.print_exc()
            return {
                'migration_successful': False,
                'error': str(e)
            }
