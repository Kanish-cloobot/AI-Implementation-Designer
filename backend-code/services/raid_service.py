import json
from datetime import datetime
from database.db_manager import DatabaseManager


class RAIDService:
    def __init__(self, db_manager):
        self.db_manager = db_manager

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
        """Get all unified extractions for a workspace"""
        query = '''
            SELECT * FROM unified_extractions
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _consolidate_risks_issues(self, extractions):
        """Consolidate risks and issues from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'risks_issues' in data and isinstance(data['risks_issues'], list):
                        for item in data['risks_issues']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_action_items(self, extractions):
        """Consolidate action items from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'action_items' in data and isinstance(data['action_items'], list):
                        for item in data['action_items']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_decisions(self, extractions):
        """Consolidate decisions from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'decisions' in data and isinstance(data['decisions'], list):
                        for item in data['decisions']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_dependencies(self, extractions):
        """Consolidate dependencies from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'dependencies' in data and isinstance(data['dependencies'], list):
                        for item in data['dependencies']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_pain_points(self, extractions):
        """Consolidate pain points from unified extractions"""
        consolidated = []
        for extraction in extractions:
            if extraction.get('extraction_data'):
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'pain_points' in data and isinstance(data['pain_points'], list):
                        for item in data['pain_points']:
                            item['created_at'] = extraction['created_at']
                            consolidated.append(item)
                except json.JSONDecodeError:
                    continue
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
