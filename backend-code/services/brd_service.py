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
            
            # Consolidate data from all extractions
            brd_data = {
                'business_units_teams': self._consolidate_business_units_teams(extractions),
                'modules_processes': self._consolidate_modules_processes(extractions),
                'license_list': self._consolidate_license_list(extractions),
                'personas': self._consolidate_personas(extractions),
                'requirements': self._consolidate_requirements(extractions),
                'current_state': self._consolidate_current_state(extractions),
                'target_state': self._consolidate_target_state(extractions),
                'applications_to_integrate': self._consolidate_integrations(extractions),
                'data_migration': self._consolidate_data_migration(extractions),
                'data_model': self._consolidate_data_model(extractions),
                'metadata_updates': self._consolidate_metadata_updates(extractions)
            }
            
            return brd_data
            
        except Exception as e:
            print(f"Error getting workspace BRD: {str(e)}")
            return None

    def _get_workspace_unified_extractions(self, workspace_id, org_id):
        """Get all unified extractions for a workspace using the unified extraction service"""
        return self.unified_extraction_service.get_workspace_extractions(workspace_id, org_id)

    def _consolidate_business_units_teams(self, extractions):
        """Consolidate business units and teams from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'bu_teams' in extraction and isinstance(extraction['bu_teams'], list):
                for item in extraction['bu_teams']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_modules_processes(self, extractions):
        """Consolidate modules and processes from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'modules_processes' in extraction and isinstance(extraction['modules_processes'], list):
                for item in extraction['modules_processes']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_license_list(self, extractions):
        """Consolidate license list from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'licenses' in extraction and isinstance(extraction['licenses'], list):
                for item in extraction['licenses']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_personas(self, extractions):
        """Consolidate personas from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'personas' in extraction and isinstance(extraction['personas'], list):
                for item in extraction['personas']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_requirements(self, extractions):
        """Consolidate requirements from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'requirements' in extraction and isinstance(extraction['requirements'], list):
                for item in extraction['requirements']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_current_state(self, extractions):
        """Consolidate current state from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'current_state' in extraction and isinstance(extraction['current_state'], list):
                for item in extraction['current_state']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_target_state(self, extractions):
        """Consolidate target state from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'target_state' in extraction and isinstance(extraction['target_state'], list):
                for item in extraction['target_state']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_integrations(self, extractions):
        """Consolidate integrations from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'integrations' in extraction and isinstance(extraction['integrations'], list):
                for item in extraction['integrations']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_data_migration(self, extractions):
        """Consolidate data migration from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'data_migration' in extraction and isinstance(extraction['data_migration'], list):
                for item in extraction['data_migration']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_data_model(self, extractions):
        """Consolidate data model from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'data_model' in extraction and isinstance(extraction['data_model'], list):
                for item in extraction['data_model']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_metadata_updates(self, extractions):
        """Consolidate metadata updates from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'metadata_updates' in extraction and isinstance(extraction['metadata_updates'], list):
                for item in extraction['metadata_updates']:
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
