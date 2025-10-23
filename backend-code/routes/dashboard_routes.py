from flask import Blueprint, request, jsonify
from database.db_manager import DatabaseManager
from services.dashboard_service import DashboardService
import os
import traceback

dashboard_routes = Blueprint('dashboard_routes', __name__)

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db')
db_manager = DatabaseManager(DB_PATH)

# Dashboard service
dashboard_service = DashboardService(db_manager)


@dashboard_routes.route('/dashboard/<workspace_id>', methods=['GET'])
def get_workspace_dashboard(workspace_id):
    """Get dashboard summary for a workspace"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        dashboard_data = dashboard_service.get_workspace_dashboard(workspace_id, org_id)
        
        if not dashboard_data:
            return jsonify({'error': 'Failed to get dashboard data'}), 500
            
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        print(f"Error getting workspace dashboard: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@dashboard_routes.route('/dashboard/<workspace_id>/summary', methods=['GET'])
def get_dashboard_summary(workspace_id):
    """Get dashboard summary counts only"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        dashboard_data = dashboard_service.get_workspace_dashboard(workspace_id, org_id)
        
        if not dashboard_data:
            return jsonify({'error': 'Failed to get dashboard data'}), 500
            
        return jsonify(dashboard_data['summary']), 200
        
    except Exception as e:
        print(f"Error getting dashboard summary: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@dashboard_routes.route('/dashboard/<workspace_id>/activity', methods=['GET'])
def get_dashboard_activity(workspace_id):
    """Get recent activity for dashboard"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        limit = request.args.get('limit', 10, type=int)
        
        dashboard_data = dashboard_service.get_workspace_dashboard(workspace_id, org_id)
        
        if not dashboard_data:
            return jsonify({'error': 'Failed to get dashboard data'}), 500
            
        return jsonify({
            'recent_activity': dashboard_data['recent_activity'][:limit]
        }), 200
        
    except Exception as e:
        print(f"Error getting dashboard activity: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
