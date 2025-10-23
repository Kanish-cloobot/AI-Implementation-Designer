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
            raid_data = {
                'risks_issues': self._get_risks_issues(workspace_id, org_id),
                'action_items': self._get_action_items(workspace_id, org_id),
                'decisions': self._get_decisions(workspace_id, org_id),
                'dependencies': self._get_dependencies(workspace_id, org_id),
                'pain_points': self._get_pain_points(workspace_id, org_id)
            }
            
            return raid_data
            
        except Exception as e:
            print(f"Error getting workspace RAID: {str(e)}")
            return None

    def _get_risks_issues(self, workspace_id, org_id):
        """Get consolidated risks and issues"""
        query = '''
            SELECT type, description_md, impact_md, mitigation_md, owner_md, due_date, created_at
            FROM extraction_risks_issues
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_action_items(self, workspace_id, org_id):
        """Get consolidated action items"""
        query = '''
            SELECT task_md, owner_md, due_date, item_status, created_at
            FROM extraction_action_items
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_decisions(self, workspace_id, org_id):
        """Get consolidated decisions"""
        query = '''
            SELECT decision_md, rationale_md, decided_on, approver_md, created_at
            FROM extraction_decisions
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_dependencies(self, workspace_id, org_id):
        """Get consolidated dependencies"""
        query = '''
            SELECT description_md, type, depends_on_md, owner_md, created_at
            FROM extraction_dependencies
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

    def _get_pain_points(self, workspace_id, org_id):
        """Get consolidated pain points"""
        query = '''
            SELECT pain_point_md, affected_bu_md, impact_md, created_at
            FROM extraction_pain_points
            WHERE workspace_id = ? AND org_id = ? AND status = 'active'
            ORDER BY created_at DESC
        '''
        return self.db_manager.fetch_all(query, (workspace_id, org_id))

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
            # Get action items by status
            action_status_query = '''
                SELECT item_status, COUNT(*) as count
                FROM extraction_action_items
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                GROUP BY item_status
            '''
            action_status = self.db_manager.fetch_all(action_status_query, (workspace_id, org_id))
            
            # Get risks by type
            risk_type_query = '''
                SELECT type, COUNT(*) as count
                FROM extraction_risks_issues
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                GROUP BY type
            '''
            risk_types = self.db_manager.fetch_all(risk_type_query, (workspace_id, org_id))
            
            # Get dependencies by type
            dependency_type_query = '''
                SELECT type, COUNT(*) as count
                FROM extraction_dependencies
                WHERE workspace_id = ? AND org_id = ? AND status = 'active'
                GROUP BY type
            '''
            dependency_types = self.db_manager.fetch_all(dependency_type_query, (workspace_id, org_id))
            
            return {
                'action_status': action_status,
                'risk_types': risk_types,
                'dependency_types': dependency_types
            }
            
        except Exception as e:
            print(f"Error getting RAID by status: {str(e)}")
            return None
