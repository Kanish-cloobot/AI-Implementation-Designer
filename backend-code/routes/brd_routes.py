from flask import Blueprint, request, jsonify
from database.db_manager import DatabaseManager
from services.brd_service import BRDService
import os
import traceback

brd_routes = Blueprint('brd_routes', __name__)

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db')
db_manager = DatabaseManager(DB_PATH)

# BRD service
brd_service = BRDService(db_manager)


@brd_routes.route('/brd/<workspace_id>', methods=['GET'])
def get_workspace_brd(workspace_id):
    """Get complete BRD for a workspace"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        brd_data = brd_service.get_workspace_brd(workspace_id, org_id)
        
        if not brd_data:
            return jsonify({'error': 'Failed to get BRD data'}), 500
            
        return jsonify(brd_data), 200
        
    except Exception as e:
        print(f"Error getting workspace BRD: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@brd_routes.route('/brd/<workspace_id>/summary', methods=['GET'])
def get_brd_summary(workspace_id):
    """Get BRD summary with counts"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        brd_summary = brd_service.get_brd_summary(workspace_id, org_id)
        
        if not brd_summary:
            return jsonify({'error': 'Failed to get BRD summary'}), 500
            
        return jsonify(brd_summary), 200
        
    except Exception as e:
        print(f"Error getting BRD summary: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@brd_routes.route('/brd/<workspace_id>/section/<section_name>', methods=['GET'])
def get_brd_section(workspace_id, section_name):
    """Get specific BRD section"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        # Map section names to service methods
        section_mappings = {
            'business_units_teams': brd_service._get_business_units_teams,
            'modules_processes': brd_service._get_modules_processes,
            'license_list': brd_service._get_license_list,
            'personas': brd_service._get_personas,
            'requirements': brd_service._get_requirements,
            'current_state': brd_service._get_current_state,
            'target_state': brd_service._get_target_state,
            'applications_to_integrate': brd_service._get_integrations,
            'data_migration': brd_service._get_data_migration,
            'data_model': brd_service._get_data_model,
            'metadata_updates': brd_service._get_metadata_updates
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
        print(f"Error getting BRD section: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
