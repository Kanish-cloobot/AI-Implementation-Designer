from flask import Blueprint, request, jsonify
import uuid
import json
from datetime import datetime
from database.db_manager import DatabaseManager
import os

workspace_bp = Blueprint('workspaces', __name__)


def get_db():
    db_path = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db'))
    return DatabaseManager(db_path)


@workspace_bp.route('/workspaces/get-all', methods=['POST'])
def get_workspaces_payload():
    try:
        data = request.get_json() or {}
        db = get_db()
        workspaces = db.fetch_all(
            'SELECT * FROM workspaces WHERE status = ? ORDER BY created_at DESC',
            ('active',)
        )
        
        for workspace in workspaces:
            if workspace.get('licenses'):
                workspace['licenses'] = json.loads(workspace['licenses'])
        
        return jsonify(workspaces), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/get-by-id', methods=['POST'])
def get_workspace_payload():
    try:
        data = request.get_json()
        if not data or not data.get('id'):
            return jsonify({'error': 'Workspace ID is required'}), 400
            
        workspace_id = data['id']
        db = get_db()
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        if workspace.get('licenses'):
            workspace['licenses'] = json.loads(workspace['licenses'])
        
        return jsonify(workspace), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/get-data', methods=['POST'])
def get_workspace_data_payload():
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'Workspace ID is required'}), 400
            
        workspace_id = data['workspace_id']
        db = get_db()
        
        # Get workspace info
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        if workspace.get('licenses'):
            workspace['licenses'] = json.loads(workspace['licenses'])
        
        # Get documents for this workspace
        documents = db.fetch_all(
            '''SELECT * FROM documents 
               WHERE workspace_id = ? AND status != ?
               ORDER BY created_at DESC''',
            (workspace_id, 'deleted')
        )
        
        # Get the most recent completed document and its unified file extraction
        completed_docs = [doc for doc in documents if doc['status'] == 'completed']
        if completed_docs:
            # Sort by created_at to get the most recent
            most_recent_doc = sorted(completed_docs, 
                                   key=lambda x: x['created_at'], reverse=True)[0]
            
            # Get the file_id for this document
            file_record = db.fetch_one(
                '''SELECT file_id FROM files 
                   WHERE workspace_id = ? AND file_name = ? AND status != ? 
                   AND storage_path = ?''',
                (workspace_id, most_recent_doc['file_name'], 'deleted', 'database_stored')
            )
            
            sow_data = None
            if file_record and file_record['file_id']:
                # Get unified file extraction data
                from services.unified_file_extraction_service import UnifiedFileExtractionService
                unified_service = UnifiedFileExtractionService(db)
                
                sow_data = unified_service.get_unified_file_extraction(
                    file_id=file_record['file_id'],
                    org_id='default_org'  # You may need to get this from request or document
                )
            
            # Keep the stream for backward compatibility (get from llm_streams)
            stream = db.fetch_one(
                '''SELECT * FROM llm_streams 
                   WHERE document_id = ? AND status = ?
                   ORDER BY created_at DESC LIMIT 1''',
                (most_recent_doc['document_id'], 'success')
            )
            
            return jsonify({
                'workspace': workspace,
                'document': most_recent_doc,
                'stream': stream,
                'sow_data': sow_data
            }), 200
        else:
            return jsonify({
                'workspace': workspace,
                'document': None,
                'stream': None,
                'sow_data': None
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/get-file-extractions', methods=['POST'])
def get_workspace_file_extractions():
    """Get all unified file extractions for a workspace"""
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'Workspace ID is required'}), 400
            
        workspace_id = data['workspace_id']
        org_id = data.get('org_id', 'default_org')  # Default org_id if not provided
        db = get_db()
        
        # Get workspace info
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        # Get all unified file extractions for this workspace
        from services.unified_file_extraction_service import UnifiedFileExtractionService
        unified_service = UnifiedFileExtractionService(db)
        
        file_extractions = unified_service.get_workspace_file_extractions(
            workspace_id=workspace_id,
            org_id=org_id
        )
        
        # Get extraction statistics
        stats = unified_service.get_extraction_statistics(
            workspace_id=workspace_id,
            org_id=org_id
        )
        
        return jsonify({
            'workspace': workspace,
            'file_extractions': file_extractions,
            'statistics': stats,
            'total_extractions': len(file_extractions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces', methods=['POST'])
def create_workspace():
    try:
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'error': 'Workspace name is required'}), 400
        if not data.get('project_type'):
            return jsonify({'error': 'Project type is required'}), 400
        if not data.get('licenses') or len(data.get('licenses', [])) == 0:
            return jsonify({'error': 'At least one license is required'}), 400
        
        licenses_json = json.dumps(data['licenses'])
        
        db = get_db()
        db.execute_query(
            '''INSERT INTO workspaces 
               (name, project_type, licenses, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (data['name'], data['project_type'], 
             licenses_json, 'active', datetime.utcnow(), datetime.utcnow())
        )
        
        # Get the auto-generated workspace_id
        workspace_record = db.fetch_one(
            'SELECT * FROM workspaces ORDER BY workspace_id DESC LIMIT 1'
        )
        workspace_id = workspace_record['workspace_id']
        
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ?',
            (workspace_id,)
        )
        workspace['licenses'] = json.loads(workspace['licenses'])
        
        return jsonify(workspace), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/update', methods=['PUT'])
def update_workspace_payload():
    try:
        data = request.get_json()
        if not data or not data.get('id'):
            return jsonify({'error': 'Workspace ID is required'}), 400
            
        workspace_id = data['id']
        db = get_db()
        
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        name = data.get('name', workspace['name'])
        project_type = data.get('project_type', workspace['project_type'])
        licenses = data.get('licenses', json.loads(workspace['licenses']))
        licenses_json = json.dumps(licenses)
        
        db.execute_query(
            '''UPDATE workspaces 
               SET name = ?, project_type = ?, licenses = ?, updated_at = ?
               WHERE workspace_id = ?''',
            (name, project_type, licenses_json, datetime.utcnow(), workspace_id)
        )
        
        updated_workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ?',
            (workspace_id,)
        )
        updated_workspace['licenses'] = json.loads(updated_workspace['licenses'])
        
        return jsonify(updated_workspace), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/delete', methods=['DELETE'])
def delete_workspace_payload():
    try:
        data = request.get_json()
        if not data or not data.get('id'):
            return jsonify({'error': 'Workspace ID is required'}), 400
            
        workspace_id = data['id']
        db = get_db()
        
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        db.execute_query(
            'UPDATE workspaces SET status = ?, updated_at = ? WHERE workspace_id = ?',
            ('deleted', datetime.utcnow(), workspace_id)
        )
        
        return jsonify({'message': 'Workspace deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/files/get-by-workspace', methods=['POST'])
def get_workspace_files_payload():
    """Get files by workspace and type using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'workspace_id is required'}), 400
            
        workspace_id = data['workspace_id']
        file_type = data.get('file_type')  # 'workspace' or 'meetings'
        
        db = get_db()
        
        if file_type:
            files = db.fetch_all(
                '''SELECT * FROM files 
                   WHERE workspace_id = ? AND file_type = ? AND status != ?
                   ORDER BY created_at DESC''',
                (workspace_id, file_type, 'deleted')
            )
        else:
            files = db.fetch_all(
                '''SELECT * FROM files 
                   WHERE workspace_id = ? AND status != ?
                   ORDER BY created_at DESC''',
                (workspace_id, 'deleted')
            )
        
        return jsonify(files), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
