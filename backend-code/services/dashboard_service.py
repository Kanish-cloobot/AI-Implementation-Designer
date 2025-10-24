import json
from datetime import datetime
from database.db_manager import DatabaseManager


class DashboardService:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def get_workspace_dashboard(self, workspace_id, org_id='default_org'):
        """
        Get dashboard summary for a workspace
        """
        try:
            # Get meeting counts
            meeting_count = self._get_meeting_count(workspace_id, org_id)
            
            # Get requirements count
            requirements_count = self._get_requirements_count(workspace_id, org_id)
            
            # Get risks and issues count
            risks_issues_count = self._get_risks_issues_count(workspace_id, org_id)
            
            # Get action items count
            action_items_count = self._get_action_items_count(workspace_id, org_id)
            
            # Get decisions count
            decisions_count = self._get_decisions_count(workspace_id, org_id)
            
            # Get dependencies count
            dependencies_count = self._get_dependencies_count(workspace_id, org_id)
            
            # Get recent meetings
            recent_meetings = self._get_recent_meetings(workspace_id, org_id)
            
            # Get upcoming meetings
            upcoming_meetings = self._get_upcoming_meetings(workspace_id, org_id)
            
            # Get recent activity
            recent_activity = self._get_recent_activity(workspace_id, org_id)
            
            return {
                'summary': {
                    'meeting_count': meeting_count,
                    'requirements_count': requirements_count,
                    'risks_issues_count': risks_issues_count,
                    'action_items_count': action_items_count,
                    'decisions_count': decisions_count,
                    'dependencies_count': dependencies_count
                },
                'recent_meetings': recent_meetings,
                'upcoming_meetings': upcoming_meetings,
                'recent_activity': recent_activity
            }
            
        except Exception as e:
            print(f"Error getting workspace dashboard: {str(e)}")
            return None

    def _get_meeting_count(self, workspace_id, org_id):
        """Get total meeting count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM meetings
            WHERE workspace_id = ? AND org_id = ? AND status != 'deleted'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

    def _get_requirements_count(self, workspace_id, org_id):
        """Get total requirements count for workspace from unified extractions"""
        return self._count_from_unified_extractions(workspace_id, org_id, 'requirements')

    def _get_risks_issues_count(self, workspace_id, org_id):
        """Get total risks and issues count for workspace from unified extractions"""
        return self._count_from_unified_extractions(workspace_id, org_id, 'risks_issues')

    def _get_action_items_count(self, workspace_id, org_id):
        """Get total action items count for workspace from unified extractions"""
        return self._count_from_unified_extractions(workspace_id, org_id, 'action_items')

    def _get_decisions_count(self, workspace_id, org_id):
        """Get total decisions count for workspace from unified extractions"""
        return self._count_from_unified_extractions(workspace_id, org_id, 'decisions')

    def _get_dependencies_count(self, workspace_id, org_id):
        """Get total dependencies count for workspace from unified extractions"""
        return self._count_from_unified_extractions(workspace_id, org_id, 'dependencies')

    def _get_recent_meetings(self, workspace_id, org_id, limit=5):
        """Get recent meetings for workspace"""
        query = '''
            SELECT meeting_id, meeting_name, meeting_datetime, status, created_at
            FROM meetings
            WHERE workspace_id = ? AND org_id = ? AND status != 'deleted'
            ORDER BY created_at DESC
            LIMIT ?
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id, limit))

    def _get_upcoming_meetings(self, workspace_id, org_id, limit=3):
        """Get upcoming meetings for workspace"""
        query = '''
            SELECT meeting_id, meeting_name, meeting_datetime, status
            FROM meetings
            WHERE workspace_id = ? AND org_id = ? AND status = 'scheduled'
            AND meeting_datetime > datetime('now')
            ORDER BY meeting_datetime ASC
            LIMIT ?
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id, limit))

    def _count_from_unified_extractions(self, workspace_id, org_id, category):
        """Count items from unified extractions for a specific category"""
        try:
            query = '''
                SELECT extraction_data FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            '''
            extractions = self.db_manager.fetch_all(query, (workspace_id, org_id))
            
            total_count = 0
            for extraction in extractions:
                if extraction.get('extraction_data'):
                    try:
                        data = json.loads(extraction['extraction_data'])
                        if category in data and isinstance(data[category], list):
                            total_count += len(data[category])
                    except json.JSONDecodeError:
                        continue
            
            return total_count
        except Exception as e:
            print(f"Error counting {category}: {str(e)}")
            return 0

    def _get_recent_activity(self, workspace_id, org_id, limit=10):
        """Get recent activity for workspace from unified extractions"""
        activities = []
        
        try:
            query = '''
                SELECT extraction_data, created_at FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                ORDER BY created_at DESC
                LIMIT ?
            '''
            extractions = self.db_manager.fetch_all(query, (workspace_id, org_id, limit))
            
            for extraction in extractions:
                if extraction.get('extraction_data'):
                    try:
                        data = json.loads(extraction['extraction_data'])
                        created_at = extraction['created_at']
                        
                        # Get recent requirements
                        if 'requirements' in data and isinstance(data['requirements'], list):
                            for req in data['requirements'][:3]:  # Limit to 3 per extraction
                                activities.append({
                                    'type': 'requirement',
                                    'description': req.get('description', '')[:100] + '...' if len(req.get('description', '')) > 100 else req.get('description', ''),
                                    'created_at': created_at,
                                    'icon': 'assignment',
                                    'color': 'purple'
                                })
                        
                        # Get recent action items
                        if 'action_items' in data and isinstance(data['action_items'], list):
                            for action in data['action_items'][:3]:  # Limit to 3 per extraction
                                activities.append({
                                    'type': 'action',
                                    'description': action.get('task', '')[:100] + '...' if len(action.get('task', '')) > 100 else action.get('task', ''),
                                    'created_at': created_at,
                                    'icon': 'task_alt',
                                    'color': 'orange'
                                })
                        
                        # Get recent decisions
                        if 'decisions' in data and isinstance(data['decisions'], list):
                            for decision in data['decisions'][:3]:  # Limit to 3 per extraction
                                activities.append({
                                    'type': 'decision',
                                    'description': decision.get('decision', '')[:100] + '...' if len(decision.get('decision', '')) > 100 else decision.get('decision', ''),
                                    'created_at': created_at,
                                    'icon': 'gavel',
                                    'color': 'green'
                                })
                                
                    except json.JSONDecodeError:
                        continue
            
            # Sort by created_at and return limited results
            activities.sort(key=lambda x: x['created_at'], reverse=True)
            return activities[:limit]
            
        except Exception as e:
            print(f"Error getting recent activity: {str(e)}")
            return []
