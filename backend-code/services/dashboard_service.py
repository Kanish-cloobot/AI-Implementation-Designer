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
        """Get total requirements count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM extraction_requirements
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

    def _get_risks_issues_count(self, workspace_id, org_id):
        """Get total risks and issues count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM extraction_risks_issues
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

    def _get_action_items_count(self, workspace_id, org_id):
        """Get total action items count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM extraction_action_items
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

    def _get_decisions_count(self, workspace_id, org_id):
        """Get total decisions count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM extraction_decisions
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

    def _get_dependencies_count(self, workspace_id, org_id):
        """Get total dependencies count for workspace"""
        query = '''
            SELECT COUNT(*) as count FROM extraction_dependencies
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
        '''
        result = self.db_manager.fetch_one(query, (workspace_id, org_id))
        return result['count'] if result else 0

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

    def _get_recent_activity(self, workspace_id, org_id, limit=10):
        """Get recent activity for workspace"""
        activities = []
        
        # Get recent requirements
        req_query = '''
            SELECT 'requirement' as type, description_md as description, created_at
            FROM extraction_requirements
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
            LIMIT ?
        '''
        requirements = self.db_manager.fetch_all(req_query, (workspace_id, org_id, limit))
        for req in requirements:
            activities.append({
                'type': 'requirement',
                'description': req['description'][:100] + '...' if len(req['description']) > 100 else req['description'],
                'created_at': req['created_at'],
                'icon': 'assignment',
                'color': 'purple'
            })
        
        # Get recent action items
        action_query = '''
            SELECT 'action' as type, task_md as description, created_at
            FROM extraction_action_items
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
            LIMIT ?
        '''
        actions = self.db_manager.fetch_all(action_query, (workspace_id, org_id, limit))
        for action in actions:
            activities.append({
                'type': 'action',
                'description': action['description'][:100] + '...' if len(action['description']) > 100 else action['description'],
                'created_at': action['created_at'],
                'icon': 'task_alt',
                'color': 'orange'
            })
        
        # Get recent decisions
        decision_query = '''
            SELECT 'decision' as type, decision_md as description, created_at
            FROM extraction_decisions
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
            LIMIT ?
        '''
        decisions = self.db_manager.fetch_all(decision_query, (workspace_id, org_id, limit))
        for decision in decisions:
            activities.append({
                'type': 'decision',
                'description': decision['description'][:100] + '...' if len(decision['description']) > 100 else decision['description'],
                'created_at': decision['created_at'],
                'icon': 'gavel',
                'color': 'green'
            })
        
        # Sort by created_at and return limited results
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        return activities[:limit]
