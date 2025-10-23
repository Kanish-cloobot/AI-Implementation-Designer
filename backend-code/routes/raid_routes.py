from flask import Blueprint, request, jsonify
from database.db_manager import DatabaseManager
from services.raid_service import RAIDService
import os
import traceback

raid_routes = Blueprint('raid_routes', __name__)

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db')
db_manager = DatabaseManager(DB_PATH)

# RAID service
raid_service = RAIDService(db_manager)


@raid_routes.route('/raid/<workspace_id>', methods=['GET'])
def get_workspace_raid(workspace_id):
    """Get complete RAID log for a workspace"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        raid_data = raid_service.get_workspace_raid(workspace_id, org_id)
        
        if not raid_data:
            return jsonify({'error': 'Failed to get RAID data'}), 500
            
        return jsonify(raid_data), 200
        
    except Exception as e:
        print(f"Error getting workspace RAID: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@raid_routes.route('/raid/<workspace_id>/summary', methods=['GET'])
def get_raid_summary(workspace_id):
    """Get RAID summary with counts"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        raid_summary = raid_service.get_raid_summary(workspace_id, org_id)
        
        if not raid_summary:
            return jsonify({'error': 'Failed to get RAID summary'}), 500
            
        return jsonify(raid_summary), 200
        
    except Exception as e:
        print(f"Error getting RAID summary: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@raid_routes.route('/raid/<workspace_id>/status', methods=['GET'])
def get_raid_by_status(workspace_id):
    """Get RAID items grouped by status"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        raid_status = raid_service.get_raid_by_status(workspace_id, org_id)
        
        if not raid_status:
            return jsonify({'error': 'Failed to get RAID status data'}), 500
            
        return jsonify(raid_status), 200
        
    except Exception as e:
        print(f"Error getting RAID by status: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@raid_routes.route('/raid/<workspace_id>/section/<section_name>', methods=['GET'])
def get_raid_section(workspace_id, section_name):
    """Get specific RAID section"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        # Map section names to service methods
        section_mappings = {
            'risks_issues': raid_service._get_risks_issues,
            'action_items': raid_service._get_action_items,
            'decisions': raid_service._get_decisions,
            'dependencies': raid_service._get_dependencies,
            'pain_points': raid_service._get_pain_points
        }
        
        if section_name not in section_mappings:
            return jsonify({'error': 'Invalid section name'}), 400
            
        section_data = section_mappings[section_name](workspace_id, org_id)
        
        return jsonify({
            'section': section_name,
            'data': section_data,
            'count': len(section_data) if section_data else 0
        }), 200
        
    except Exception as e:
        print(f"Error getting RAID section: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
