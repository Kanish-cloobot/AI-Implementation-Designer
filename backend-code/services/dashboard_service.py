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
            # Count rows where type matches the category
            query = '''
                SELECT COUNT(*) as count FROM unified_extractions
                WHERE workspace_id = ? AND org_id = ? AND status = 'active' AND type = ?
            '''
            result = self.db_manager.fetch_one(query, (workspace_id, org_id, category))
            return result['count'] if result else 0
            
        except Exception as e:
            print(f"Error counting {category}: {str(e)}")
            return 0

    def _get_recent_activity(self, workspace_id, org_id, limit=10):
        """Get recent activity for workspace from unified extractions"""
        activities = []
        
        try:
            query = '''
                SELECT type, extraction_data, created_at FROM unified_extractions
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
                        extraction_type = extraction.get('type', '')
                        
                        # Handle different types of activities
                        if extraction_type == 'requirements' and isinstance(data, dict):
                            activities.append({
                                'type': 'requirement',
                                'description': data.get('description', '')[:100] + '...' if len(data.get('description', '')) > 100 else data.get('description', ''),
                                'created_at': created_at,
                                'icon': 'assignment',
                                'color': 'purple'
                            })
                        
                        elif extraction_type == 'action_items' and isinstance(data, dict):
                            activities.append({
                                'type': 'action',
                                'description': data.get('task', '')[:100] + '...' if len(data.get('task', '')) > 100 else data.get('task', ''),
                                'created_at': created_at,
                                'icon': 'task_alt',
                                'color': 'orange'
                            })
                        
                        elif extraction_type == 'risks_issues' and isinstance(data, dict):
                            activities.append({
                                'type': 'risk',
                                'description': data.get('description', '')[:100] + '...' if len(data.get('description', '')) > 100 else data.get('description', ''),
                                'created_at': created_at,
                                'icon': 'warning',
                                'color': 'red'
                            })
                        
                        elif extraction_type == 'decisions' and isinstance(data, dict):
                            activities.append({
                                'type': 'decision',
                                'description': data.get('decision', '')[:100] + '...' if len(data.get('decision', '')) > 100 else data.get('decision', ''),
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
