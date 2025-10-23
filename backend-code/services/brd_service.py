import json
from datetime import datetime
from database.db_manager import DatabaseManager


class BRDService:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def get_workspace_brd(self, workspace_id, org_id='default_org'):
        """
        Get consolidated BRD (Business Requirements Document) for a workspace
        """
        try:
            brd_data = {
                'business_units_teams': self._get_business_units_teams(workspace_id, org_id),
                'modules_processes': self._get_modules_processes(workspace_id, org_id),
                'license_list': self._get_license_list(workspace_id, org_id),
                'personas': self._get_personas(workspace_id, org_id),
                'requirements': self._get_requirements(workspace_id, org_id),
                'current_state': self._get_current_state(workspace_id, org_id),
                'target_state': self._get_target_state(workspace_id, org_id),
                'applications_to_integrate': self._get_integrations(workspace_id, org_id),
                'data_migration': self._get_data_migration(workspace_id, org_id),
                'data_model': self._get_data_model(workspace_id, org_id),
                'metadata_updates': self._get_metadata_updates(workspace_id, org_id)
            }
            
            return brd_data
            
        except Exception as e:
            print(f"Error getting workspace BRD: {str(e)}")
            return None

    def _get_business_units_teams(self, workspace_id, org_id):
        """Get consolidated business units and teams"""
        query = '''
            SELECT business_unit, teams, notes_md, created_at
            FROM extraction_bu_teams
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_modules_processes(self, workspace_id, org_id):
        """Get consolidated modules and processes"""
        query = '''
            SELECT module_name, processes, scope_tag, notes_md, created_at
            FROM extraction_modules_processes
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_license_list(self, workspace_id, org_id):
        """Get consolidated license list"""
        query = '''
            SELECT license_type, count, allocation_md, notes_md, created_at
            FROM extraction_licenses
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_personas(self, workspace_id, org_id):
        """Get consolidated personas"""
        query = '''
            SELECT persona_name, responsibilities, primary_modules, created_at
            FROM extraction_personas
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_requirements(self, workspace_id, org_id):
        """Get consolidated requirements"""
        query = '''
            SELECT requirement_type, description_md, acceptance_criteria, created_at
            FROM extraction_requirements
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_current_state(self, workspace_id, org_id):
        """Get consolidated current state (As-is)"""
        query = '''
            SELECT description_md, created_at
            FROM extraction_current_state
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_target_state(self, workspace_id, org_id):
        """Get consolidated target state (To-be)"""
        query = '''
            SELECT description_md, created_at
            FROM extraction_target_state
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_integrations(self, workspace_id, org_id):
        """Get consolidated applications to integrate"""
        query = '''
            SELECT application_name, purpose_md, integration_type, directionality, notes_md, created_at
            FROM extraction_integrations
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_data_migration(self, workspace_id, org_id):
        """Get consolidated data migration information"""
        query = '''
            SELECT source_md, mapping_notes_md, cleansing_rules_md, tools_md, created_at
            FROM extraction_data_migration
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_data_model(self, workspace_id, org_id):
        """Get consolidated data model"""
        query = '''
            SELECT entity_name, entity_type, key_fields, relationships_md, created_at
            FROM extraction_data_model
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_metadata_updates(self, workspace_id, org_id):
        """Get consolidated metadata updates"""
        query = '''
            SELECT component_type, api_name_md, change_type, scope_md, created_at
            FROM extraction_metadata_updates
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def get_brd_summary(self, workspace_id, org_id='default_org'):
        """
        Get BRD summary with counts for each section
        """
        try:
            brd_data = self.get_workspace_brd(workspace_id, org_id)
            
            if not brd_data:
                return None
                
            summary = {}
            for key, data in brd_data.items():
                summary[key] = {
                    'count': len(data) if data else 0,
                    'data': data
                }
            
            return summary
            
        except Exception as e:
            print(f"Error getting BRD summary: {str(e)}")
            return None
