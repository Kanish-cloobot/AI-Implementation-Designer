from flask import Blueprint, request, jsonify
import uuid
import json
from datetime import datetime
from database.db_manager import DatabaseManager
import os

workspace_bp = Blueprint('workspaces', __name__)


def get_db():
    db_path = os.getenv('DATABASE_PATH', './database/ids.db')
    return DatabaseManager(db_path)


@workspace_bp.route('/workspaces', methods=['GET'])
def get_workspaces():
    try:
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


@workspace_bp.route('/workspaces/<workspace_id>', methods=['GET'])
def get_workspace(workspace_id):
    try:
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
        
        workspace_id = str(uuid.uuid4())
        licenses_json = json.dumps(data['licenses'])
        
        db = get_db()
        db.execute_query(
            '''INSERT INTO workspaces 
               (workspace_id, name, project_type, licenses, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (workspace_id, data['name'], data['project_type'], 
             licenses_json, 'active', datetime.utcnow(), datetime.utcnow())
        )
        
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ?',
            (workspace_id,)
        )
        workspace['licenses'] = json.loads(workspace['licenses'])
        
        return jsonify(workspace), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@workspace_bp.route('/workspaces/<workspace_id>', methods=['PUT'])
def update_workspace(workspace_id):
    try:
        data = request.get_json()
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


@workspace_bp.route('/workspaces/<workspace_id>', methods=['DELETE'])
def delete_workspace(workspace_id):
    try:
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

