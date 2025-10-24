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
        """Get all unified extractions for a workspace"""
        query = '''
            SELECT * FROM unified_extractions
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _consolidate_business_units_teams(self, extractions):
        """Consolidate business units and teams from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'bu_teams' in data and isinstance(data['bu_teams'], list):
                        for item in data['bu_teams']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_modules_processes(self, extractions):
        """Consolidate modules and processes from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'modules_processes' in data and isinstance(data['modules_processes'], list):
                        for item in data['modules_processes']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_license_list(self, extractions):
        """Consolidate license list from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'licenses' in data and isinstance(data['licenses'], list):
                        for item in data['licenses']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_personas(self, extractions):
        """Consolidate personas from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'personas' in data and isinstance(data['personas'], list):
                        for item in data['personas']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_requirements(self, extractions):
        """Consolidate requirements from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'requirements' in data and isinstance(data['requirements'], list):
                        for item in data['requirements']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_current_state(self, extractions):
        """Consolidate current state from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'current_state' in data and isinstance(data['current_state'], list):
                        for item in data['current_state']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_target_state(self, extractions):
        """Consolidate target state from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'target_state' in data and isinstance(data['target_state'], list):
                        for item in data['target_state']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_integrations(self, extractions):
        """Consolidate integrations from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'integrations' in data and isinstance(data['integrations'], list):
                        for item in data['integrations']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_data_migration(self, extractions):
        """Consolidate data migration from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'data_migration' in data and isinstance(data['data_migration'], list):
                        for item in data['data_migration']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_data_model(self, extractions):
        """Consolidate data model from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'data_model' in data and isinstance(data['data_model'], list):
                        for item in data['data_model']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_metadata_updates(self, extractions):
        """Consolidate metadata updates from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'metadata_updates' in data and isinstance(data['metadata_updates'], list):
                        for item in data['metadata_updates']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
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
