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

    def get_meeting_raid(self, meeting_id, org_id='default_org'):
        """
        Get consolidated RAID (Risks, Actions, Issues, Dependencies) log for a specific meeting
        """
        try:
            # Get unified extraction for the specific meeting
            extraction = self.unified_extraction_service.get_unified_extraction(meeting_id, org_id)
            
            if not extraction:
                return None
            
            # Consolidate data from the extraction
            raid_data = {
                'risks_issues': self._consolidate_risks_issues([extraction]),
                'action_items': self._consolidate_action_items([extraction]),
                'decisions': self._consolidate_decisions([extraction]),
                'dependencies': self._consolidate_dependencies([extraction]),
                'pain_points': self._consolidate_pain_points([extraction])
            }
            
            return raid_data
            
        except Exception as e:
            print(f"Error getting meeting RAID: {str(e)}")
            return None

    def _get_workspace_unified_extractions(self, workspace_id, org_id):
        """Get all unified extractions for a workspace using the unified extraction service"""
        return self.unified_extraction_service.get_workspace_extractions(workspace_id, org_id)

    def _consolidate_risks_issues(self, extractions):
        """Consolidate risks and issues from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # Check if data is already parsed (from get_unified_extraction) or needs parsing (from get_workspace_extractions)
            if 'risks_issues' in extraction:
                risks_data = extraction['risks_issues']
                if isinstance(risks_data, list):
                    # Data is a list of items
                    for item in risks_data:
                        if isinstance(item, dict):
                            item['created_at'] = extraction.get('created_at')
                            consolidated.append(item)
                elif isinstance(risks_data, dict):
                    # Data is a single item
                    risks_data['created_at'] = extraction.get('created_at')
                    consolidated.append(risks_data)
            elif 'extraction_data' in extraction:
                # Data needs to be parsed from JSON
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'risks_issues' in data:
                        risks_data = data['risks_issues']
                        if isinstance(risks_data, list):
                            for item in risks_data:
                                if isinstance(item, dict):
                                    item['created_at'] = extraction.get('created_at')
                                    consolidated.append(item)
                        elif isinstance(risks_data, dict):
                            risks_data['created_at'] = extraction.get('created_at')
                            consolidated.append(risks_data)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_action_items(self, extractions):
        """Consolidate action items from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # Check if data is already parsed (from get_unified_extraction) or needs parsing (from get_workspace_extractions)
            if 'action_items' in extraction and isinstance(extraction['action_items'], list):
                # Data is already parsed and available as direct keys
                for item in extraction['action_items']:
                    if isinstance(item, dict):
                        item['created_at'] = extraction.get('created_at')
                        consolidated.append(item)
            elif 'extraction_data' in extraction:
                # Data needs to be parsed from JSON
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'action_items' in data and isinstance(data['action_items'], list):
                        for item in data['action_items']:
                            if isinstance(item, dict):
                                item['created_at'] = extraction.get('created_at')
                                consolidated.append(item)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_decisions(self, extractions):
        """Consolidate decisions from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # Check if data is already parsed (from get_unified_extraction) or needs parsing (from get_workspace_extractions)
            if 'decisions' in extraction:
                decisions_data = extraction['decisions']
                if isinstance(decisions_data, list):
                    # Data is a list of items
                    for item in decisions_data:
                        if isinstance(item, dict):
                            item['created_at'] = extraction.get('created_at')
                            consolidated.append(item)
                elif isinstance(decisions_data, dict):
                    # Data is a single item
                    decisions_data['created_at'] = extraction.get('created_at')
                    consolidated.append(decisions_data)
            elif 'extraction_data' in extraction:
                # Data needs to be parsed from JSON
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'decisions' in data:
                        decisions_data = data['decisions']
                        if isinstance(decisions_data, list):
                            for item in decisions_data:
                                if isinstance(item, dict):
                                    item['created_at'] = extraction.get('created_at')
                                    consolidated.append(item)
                        elif isinstance(decisions_data, dict):
                            decisions_data['created_at'] = extraction.get('created_at')
                            consolidated.append(decisions_data)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_dependencies(self, extractions):
        """Consolidate dependencies from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # Check if data is already parsed (from get_unified_extraction) or needs parsing (from get_workspace_extractions)
            if 'dependencies' in extraction:
                dependencies_data = extraction['dependencies']
                if isinstance(dependencies_data, list):
                    # Data is a list of items
                    for item in dependencies_data:
                        if isinstance(item, dict):
                            item['created_at'] = extraction.get('created_at')
                            consolidated.append(item)
                elif isinstance(dependencies_data, dict):
                    # Data is a single item
                    dependencies_data['created_at'] = extraction.get('created_at')
                    consolidated.append(dependencies_data)
            elif 'extraction_data' in extraction:
                # Data needs to be parsed from JSON
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'dependencies' in data:
                        dependencies_data = data['dependencies']
                        if isinstance(dependencies_data, list):
                            for item in dependencies_data:
                                if isinstance(item, dict):
                                    item['created_at'] = extraction.get('created_at')
                                    consolidated.append(item)
                        elif isinstance(dependencies_data, dict):
                            dependencies_data['created_at'] = extraction.get('created_at')
                            consolidated.append(dependencies_data)
                except json.JSONDecodeError:
                    continue
        return consolidated

    def _consolidate_pain_points(self, extractions):
        """Consolidate pain points from unified extractions"""
        consolidated = []
        for extraction in extractions:
            # Check if data is already parsed (from get_unified_extraction) or needs parsing (from get_workspace_extractions)
            if 'pain_points' in extraction:
                pain_points_data = extraction['pain_points']
                if isinstance(pain_points_data, list):
                    # Data is a list of items
                    for item in pain_points_data:
                        if isinstance(item, dict):
                            item['created_at'] = extraction.get('created_at')
                            consolidated.append(item)
                elif isinstance(pain_points_data, dict):
                    # Data is a single item
                    pain_points_data['created_at'] = extraction.get('created_at')
                    consolidated.append(pain_points_data)
            elif 'extraction_data' in extraction:
                # Data needs to be parsed from JSON
                try:
                    data = json.loads(extraction['extraction_data'])
                    if 'pain_points' in data:
                        pain_points_data = data['pain_points']
                        if isinstance(pain_points_data, list):
                            for item in pain_points_data:
                                if isinstance(item, dict):
                                    item['created_at'] = extraction.get('created_at')
                                    consolidated.append(item)
                        elif isinstance(pain_points_data, dict):
                            pain_points_data['created_at'] = extraction.get('created_at')
                            consolidated.append(pain_points_data)
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

    def _get_risks_issues(self, workspace_id_or_extractions, org_id='default_org'):
        """Get risks and issues for a workspace or from extractions"""
        try:
            # Check if first parameter is a list (extractions) or workspace_id
            if isinstance(workspace_id_or_extractions, list):
                # Direct extractions provided
                return self._consolidate_risks_issues(workspace_id_or_extractions)
            else:
                # Workspace ID provided
                extractions = self._get_workspace_unified_extractions(workspace_id_or_extractions, org_id)
                return self._consolidate_risks_issues(extractions)
        except Exception as e:
            print(f"Error getting risks and issues: {str(e)}")
            return []

    def _get_action_items(self, workspace_id_or_extractions, org_id='default_org'):
        """Get action items for a workspace or from extractions"""
        try:
            # Check if first parameter is a list (extractions) or workspace_id
            if isinstance(workspace_id_or_extractions, list):
                # Direct extractions provided
                return self._consolidate_action_items(workspace_id_or_extractions)
            else:
                # Workspace ID provided
                extractions = self._get_workspace_unified_extractions(workspace_id_or_extractions, org_id)
                return self._consolidate_action_items(extractions)
        except Exception as e:
            print(f"Error getting action items: {str(e)}")
            return []

    def _get_decisions(self, workspace_id_or_extractions, org_id='default_org'):
        """Get decisions for a workspace or from extractions"""
        try:
            # Check if first parameter is a list (extractions) or workspace_id
            if isinstance(workspace_id_or_extractions, list):
                # Direct extractions provided
                return self._consolidate_decisions(workspace_id_or_extractions)
            else:
                # Workspace ID provided
                extractions = self._get_workspace_unified_extractions(workspace_id_or_extractions, org_id)
                return self._consolidate_decisions(extractions)
        except Exception as e:
            print(f"Error getting decisions: {str(e)}")
            return []

    def _get_dependencies(self, workspace_id_or_extractions, org_id='default_org'):
        """Get dependencies for a workspace or from extractions"""
        try:
            # Check if first parameter is a list (extractions) or workspace_id
            if isinstance(workspace_id_or_extractions, list):
                # Direct extractions provided
                return self._consolidate_dependencies(workspace_id_or_extractions)
            else:
                # Workspace ID provided
                extractions = self._get_workspace_unified_extractions(workspace_id_or_extractions, org_id)
                return self._consolidate_dependencies(extractions)
        except Exception as e:
            print(f"Error getting dependencies: {str(e)}")
            return []

    def _get_pain_points(self, workspace_id_or_extractions, org_id='default_org'):
        """Get pain points for a workspace or from extractions"""
        try:
            # Check if first parameter is a list (extractions) or workspace_id
            if isinstance(workspace_id_or_extractions, list):
                # Direct extractions provided
                return self._consolidate_pain_points(workspace_id_or_extractions)
            else:
                # Workspace ID provided
                extractions = self._get_workspace_unified_extractions(workspace_id_or_extractions, org_id)
                return self._consolidate_pain_points(extractions)
        except Exception as e:
            print(f"Error getting pain points: {str(e)}")
            return []
