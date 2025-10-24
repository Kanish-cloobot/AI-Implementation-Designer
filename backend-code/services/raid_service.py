import json
from datetime import datetime
from database.db_manager import DatabaseManager
from services.unified_extraction_service import UnifiedExtractionService


class RAIDService:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.unified_extraction_service = UnifiedExtractionService(db_manager)

    def get_workspace_raid(self, workspace_id, org_id='default_org'):
        """
        Get consolidated RAID (Risks, Actions, Issues, Dependencies) log for a workspace
        """
        try:
            # Get all unified extractions for the workspace
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            
            # Consolidate data from all extractions
            raid_data = {
                'risks_issues': self._consolidate_risks_issues(extractions),
                'action_items': self._consolidate_action_items(extractions),
                'decisions': self._consolidate_decisions(extractions),
                'dependencies': self._consolidate_dependencies(extractions),
                'pain_points': self._consolidate_pain_points(extractions)
            }
            
            return raid_data
            
        except Exception as e:
            print(f"Error getting workspace RAID: {str(e)}")
            return None

    def _get_workspace_unified_extractions(self, workspace_id, org_id):
        """Get all unified extractions for a workspace using the unified extraction service"""
        return self.unified_extraction_service.get_workspace_extractions(workspace_id, org_id)

    def _consolidate_risks_issues(self, extractions):
        """Consolidate risks and issues from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'risks_issues' in extraction and isinstance(extraction['risks_issues'], list):
                for item in extraction['risks_issues']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_action_items(self, extractions):
        """Consolidate action items from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'action_items' in extraction and isinstance(extraction['action_items'], list):
                for item in extraction['action_items']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_decisions(self, extractions):
        """Consolidate decisions from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'decisions' in extraction and isinstance(extraction['decisions'], list):
                for item in extraction['decisions']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_dependencies(self, extractions):
        """Consolidate dependencies from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'dependencies' in extraction and isinstance(extraction['dependencies'], list):
                for item in extraction['dependencies']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def _consolidate_pain_points(self, extractions):
        """Consolidate pain points from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # With new structure, data is already parsed and available as direct keys
            if 'pain_points' in extraction and isinstance(extraction['pain_points'], list):
                for item in extraction['pain_points']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
        return consolidated

    def get_raid_summary(self, workspace_id, org_id='default_org'):
        """
        Get RAID summary with counts for each section
        """
        try:
            raid_data = self.get_workspace_raid(workspace_id, org_id)
            
            if not raid_data:
                return None
                
            summary = {}
            for key, data in raid_data.items():
                summary[key] = {
                    'count': len(data) if data else 0,
                    'data': data
                }
            
            return summary
            
        except Exception as e:
            print(f"Error getting RAID summary: {str(e)}")
            return None

    def get_raid_by_status(self, workspace_id, org_id='default_org'):
        """
        Get RAID items grouped by status for better tracking
        """
        try:
            # Get all unified extractions for the workspace
            extractions = self._get_workspace_unified_extractions(workspace_id, org_id)
            
            # Count action items by status
            action_status_counts = {}
            risk_type_counts = {}
            dependency_type_counts = {}
            
            for extraction in extractions:
                if extraction.get('extraction_data'):
                    try:
                        data = json.loads(extraction['extraction_data'])
                        
                        # Count action items by status
                        if 'action_items' in data and isinstance(data['action_items'], list):
                            for item in data['action_items']:
                                status = item.get('item_status', 'unknown')
                                action_status_counts[status] = action_status_counts.get(status, 0) + 1
                        
                        # Count risks by type
                        if 'risks_issues' in data and isinstance(data['risks_issues'], list):
                            for item in data['risks_issues']:
                                risk_type = item.get('type', 'unknown')
                                risk_type_counts[risk_type] = risk_type_counts.get(risk_type, 0) + 1
                        
                        # Count dependencies by type
                        if 'dependencies' in data and isinstance(data['dependencies'], list):
                            for item in data['dependencies']:
                                dep_type = item.get('type', 'unknown')
                                dependency_type_counts[dep_type] = dependency_type_counts.get(dep_type, 0) + 1
                                
                    except json.JSONDecodeError:
                        continue
            
            # Convert to list format for consistency
            action_status = [{'item_status': status, 'count': count} for status, count in action_status_counts.items()]
            risk_types = [{'type': risk_type, 'count': count} for risk_type, count in risk_type_counts.items()]
            dependency_types = [{'type': dep_type, 'count': count} for dep_type, count in dependency_type_counts.items()]
            
            return {
                'action_status': action_status,
                'risk_types': risk_types,
                'dependency_types': dependency_types
            }
            
        except Exception as e:
            print(f"Error getting RAID by status: {str(e)}")
            return None
