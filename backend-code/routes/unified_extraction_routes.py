"""
Unified Extraction Routes

API routes for handling unified extraction data.
"""

from flask import Blueprint, request, jsonify
from services.unified_extraction_service import UnifiedExtractionService
from services.extraction_migration_service import ExtractionMigrationService
from database.db_manager import DatabaseManager
import traceback

# Create blueprint
unified_extraction_bp = Blueprint('unified_extraction', __name__)

# Initialize database manager
db_manager = DatabaseManager('database/ids.db')
unified_extraction_service = UnifiedExtractionService(db_manager)
migration_service = ExtractionMigrationService(db_manager)


@unified_extraction_bp.route('/unified-extractions/meeting/<int:meeting_id>', methods=['GET'])
def get_meeting_extraction(meeting_id):
    """
    Get unified extraction data for a specific meeting
    """
    try:
        org_id = request.args.get('org_id')
        if not org_id:
            return jsonify({'error': 'org_id parameter is required'}), 400
        
        extraction_data = unified_extraction_service.get_unified_extraction(meeting_id, org_id)
        
        if not extraction_data:
            return jsonify({'message': 'No extraction data found for this meeting'}), 404
        
        return jsonify({
            'status': 'success',
            'data': extraction_data
        })
        
    except Exception as e:
        print(f"Error getting meeting extraction: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/workspace/<int:workspace_id>', methods=['GET'])
def get_workspace_extractions(workspace_id):
    """
    Get all unified extraction data for a workspace
    """
    try:
        org_id = request.args.get('org_id')
        if not org_id:
            return jsonify({'error': 'org_id parameter is required'}), 400
        
        extractions = unified_extraction_service.get_workspace_extractions(workspace_id, org_id)
        
        return jsonify({
            'status': 'success',
            'data': extractions,
            'count': len(extractions)
        })
        
    except Exception as e:
        print(f"Error getting workspace extractions: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/store', methods=['POST'])
def store_unified_extraction():
    """
    Store unified extraction data
    """
    try:
        data = request.get_json()
        
        required_fields = ['meeting_id', 'workspace_id', 'org_id', 'extraction_data']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Store the unified extraction
        unified_extraction_service.store_unified_extraction(
            meeting_id=data['meeting_id'],
            workspace_id=data['workspace_id'],
            org_id=data['org_id'],
            extraction_data=data['extraction_data'],
            created_by=data.get('created_by')
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Unified extraction stored successfully'
        })
        
    except Exception as e:
        print(f"Error storing unified extraction: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/<int:extraction_id>/status', methods=['PUT'])
def update_extraction_status(extraction_id):
    """
    Update extraction status
    """
    try:
        data = request.get_json()
        status = data.get('status')
        updated_by = data.get('updated_by')
        
        if not status:
            return jsonify({'error': 'status is required'}), 400
        
        unified_extraction_service.update_extraction_status(
            extraction_id=extraction_id,
            status=status,
            updated_by=updated_by
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Extraction status updated successfully'
        })
        
    except Exception as e:
        print(f"Error updating extraction status: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/<int:extraction_id>', methods=['DELETE'])
def delete_extraction(extraction_id):
    """
    Delete an extraction (soft delete)
    """
    try:
        org_id = request.args.get('org_id')
        if not org_id:
            return jsonify({'error': 'org_id parameter is required'}), 400
        
        unified_extraction_service.delete_extraction(extraction_id, org_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Extraction deleted successfully'
        })
        
    except Exception as e:
        print(f"Error deleting extraction: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/workspace/<int:workspace_id>/statistics', methods=['GET'])
def get_extraction_statistics(workspace_id):
    """
    Get extraction statistics for a workspace
    """
    try:
        org_id = request.args.get('org_id')
        if not org_id:
            return jsonify({'error': 'org_id parameter is required'}), 400
        
        statistics = unified_extraction_service.get_extraction_statistics(workspace_id, org_id)
        
        return jsonify({
            'status': 'success',
            'data': statistics
        })
        
    except Exception as e:
        print(f"Error getting extraction statistics: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/migrate', methods=['POST'])
def migrate_extractions():
    """
    Migrate existing extractions to unified table
    """
    try:
        data = request.get_json() or {}
        org_id = data.get('org_id')
        
        # Run migration
        migration_result = migration_service.migrate_all_extractions(org_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Migration completed',
            'data': migration_result
        })
        
    except Exception as e:
        print(f"Error migrating extractions: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


@unified_extraction_bp.route('/unified-extractions/verify-migration', methods=['GET'])
def verify_migration():
    """
    Verify migration results
    """
    try:
        org_id = request.args.get('org_id')
        
        verification_result = migration_service.verify_migration(org_id)
        
        return jsonify({
            'status': 'success',
            'data': verification_result
        })
        
    except Exception as e:
        print(f"Error verifying migration: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500
