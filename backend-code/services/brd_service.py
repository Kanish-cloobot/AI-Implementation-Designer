import json
from datetime import datetime
from database.db_manager import DatabaseManager
from services.unified_extraction_service import UnifiedExtractionService


class BRDService:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.unified_extraction_service = UnifiedExtractionService(db_manager)

    def get_workspace_brd(self, workspace_id, org_id='default_org'):
        """
        Get consolidated BRD (Business Requirements Document) for a workspace
        """
        try:
            # Get all unified extractions for the workspace
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            
            # Consolidate data from all extractions using generic method
            brd_data = {
                'business_units_teams': self._consolidate_data(extractions, 'bu_teams'),
                'modules_processes': self._consolidate_data(extractions, 'modules_processes'),
                'license_list': self._consolidate_data(extractions, 'licenses'),
                'personas': self._consolidate_data(extractions, 'personas'),
                'requirements': self._consolidate_data(extractions, 'requirements'),
                'current_state': self._consolidate_data(extractions, 'current_state'),
                'target_state': self._consolidate_data(extractions, 'target_state'),
                'applications_to_integrate': self._consolidate_data(extractions, 'integrations'),
                'data_migration': self._consolidate_data(extractions, 'data_migration'),
                'data_model': self._consolidate_data(extractions, 'data_model'),
                'metadata_updates': self._consolidate_data(extractions, 'metadata_updates'),
                'pain_points': self._consolidate_data(extractions, 'pain_points'),
            }
            
            return brd_data
            
        except Exception as e:
            print(f"Error getting workspace BRD: {str(e)}")
            return None

    def _get_workspace_unified_extractions(self, workspace_id, org_id):
        """Get all unified extractions for a workspace using the unified extraction service"""
        return self.unified_extraction_service.get_workspace_extractions(workspace_id, org_id)

    def _consolidate_data(self, extractions, key_name):
        """
        Generic method to consolidate data from unified extractions
        Eliminates redundancy by handling all consolidation logic in one place
        """
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if key_name in extraction and isinstance(extraction[key_name], list):
                for item in extraction[key_name]:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

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

    def _get_business_units_teams(self, workspace_id, org_id='default_org'):
        """Get business units and teams section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'bu_teams')
        except Exception as e:
            print(f"Error getting business units teams: {str(e)}")
            return []

    def _get_modules_processes(self, workspace_id, org_id='default_org'):
        """Get modules and processes section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'modules_processes')
        except Exception as e:
            print(f"Error getting modules processes: {str(e)}")
            return []

    def _get_license_list(self, workspace_id, org_id='default_org'):
        """Get license list section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'licenses')
        except Exception as e:
            print(f"Error getting license list: {str(e)}")
            return []

    def _get_personas(self, workspace_id, org_id='default_org'):
        """Get personas section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'personas')
        except Exception as e:
            print(f"Error getting personas: {str(e)}")
            return []

    def _get_requirements(self, workspace_id, org_id='default_org'):
        """Get requirements section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'requirements')
        except Exception as e:
            print(f"Error getting requirements: {str(e)}")
            return []

    def _get_current_state(self, workspace_id, org_id='default_org'):
        """Get current state section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'current_state')
        except Exception as e:
            print(f"Error getting current state: {str(e)}")
            return []

    def _get_target_state(self, workspace_id, org_id='default_org'):
        """Get target state section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'target_state')
        except Exception as e:
            print(f"Error getting target state: {str(e)}")
            return []

    def _get_integrations(self, workspace_id, org_id='default_org'):
        """Get applications to integrate section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'integrations')
        except Exception as e:
            print(f"Error getting integrations: {str(e)}")
            return []

    def _get_data_migration(self, workspace_id, org_id='default_org'):
        """Get data migration section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'data_migration')
        except Exception as e:
            print(f"Error getting data migration: {str(e)}")
            return []

    def _get_data_model(self, workspace_id, org_id='default_org'):
        """Get data model section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'data_model')
        except Exception as e:
            print(f"Error getting data model: {str(e)}")
            return []

    def _get_metadata_updates(self, workspace_id, org_id='default_org'):
        """Get metadata updates section"""
        try:
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            return self._consolidate_data(extractions, 'metadata_updates')
        except Exception as e:
            print(f"Error getting metadata updates: {str(e)}")
            return []