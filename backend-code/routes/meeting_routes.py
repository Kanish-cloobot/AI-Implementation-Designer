from flask import Blueprint, request, jsonify
from database.db_manager import DatabaseManager
from services.meeting_extraction_service import MeetingExtractionService
import uuid
import os
from datetime import datetime
import traceback

meeting_routes = Blueprint('meeting_routes', __name__)

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db')
db_manager = DatabaseManager(DB_PATH)

# No file storage needed - only database metadata

# Meeting extraction service
extraction_service = MeetingExtractionService(db_manager)


@meeting_routes.route('/meetings', methods=['POST'])
def create_meeting():
    """Create a new meeting"""
    try:
        meeting_id = str(uuid.uuid4())
        workspace_id = request.form.get('workspace_id')
        org_id = request.form.get('org_id', 'default_org')
        meeting_name = request.form.get('meeting_name')
        stakeholders = request.form.get('stakeholders', '')
        meeting_datetime = request.form.get('meeting_datetime', '')
        meeting_details = request.form.get('meeting_details', '')
        status = request.form.get('status', 'scheduled')

        if not workspace_id or not meeting_name:
            return jsonify({'error': 'workspace_id and meeting_name are required'}), 400

        # Insert meeting record
        query = '''
            INSERT INTO meetings (
                workspace_id, org_id, meeting_name,
                stakeholders, meeting_datetime, meeting_details,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        params = (
            workspace_id, org_id, meeting_name,
            stakeholders, meeting_datetime, meeting_details,
            status, datetime.now(), datetime.now()
        )
        db_manager.execute_query(query, params)
        
        # Get the auto-generated meeting_id
        meeting_id = db_manager.fetch_one(
            'SELECT meeting_id FROM meetings ORDER BY meeting_id DESC LIMIT 1'
        )['meeting_id']

        # Handle file storage with actual content
        uploaded_files = []
        files = request.files.getlist('files')

        for file in files:
            if file and file.filename:
                file_ext = os.path.splitext(file.filename)[1]
                # Read file content for storage
                file_content = file.read()
                file_size = len(file_content)
                file.seek(0)  # Reset file pointer for potential reuse

                # Insert into unified files table with actual content
                unified_file_query = '''
                    INSERT INTO files (
                        workspace_id, file_type, file_name,
                        storage_path, file_content, file_extension, file_size, status,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                '''
                unified_file_params = (
                    workspace_id, 'meetings', file.filename,
                    'database_stored', file_content, file_ext, file_size, 'uploaded',
                    datetime.now(), datetime.now()
                )
                db_manager.execute_query(unified_file_query, unified_file_params)
                
                # Get the auto-generated file_id from unified files table
                file_id = db_manager.fetch_one(
                    'SELECT file_id FROM files ORDER BY file_id DESC LIMIT 1'
                )['file_id']
                
                # Also insert into meeting_files table for backward compatibility
                file_query = '''
                    INSERT INTO meeting_files (
                        meeting_id, workspace_id, org_id,
                        file_name, storage_path, file_type, file_size,
                        status, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                '''
                file_params = (
                    meeting_id, workspace_id, org_id,
                    file.filename, 'database_stored', file_ext, file_size,
                    'uploaded', datetime.now(), datetime.now()
                )
                db_manager.execute_query(file_query, file_params)
                uploaded_files.append({
                    'file_id': file_id,
                    'file_name': file.filename,
                    'file_type': file_ext,
                    'file_size': file_size
                })

        # If files were uploaded, process them for extraction
        extraction_result = None
        if uploaded_files:
            extraction_result = extraction_service.process_meeting_files(
                meeting_id, workspace_id, org_id
            )

        return jsonify({
            'meeting_id': meeting_id,
            'message': 'Meeting created successfully',
            'uploaded_files': uploaded_files,
            'extraction_result': extraction_result
        }), 201

    except Exception as e:
        print(f"Error creating meeting: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/meetings/get-all', methods=['POST'])
def get_meetings_payload():
    """Get all meetings for a workspace using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'workspace_id is required'}), 400
            
        workspace_id = data['workspace_id']
        org_id = data.get('org_id', 'default_org')
        status = data.get('status')

        query = '''
            SELECT * FROM meetings
            WHERE workspace_id = ? AND org_id = ?
        '''
        params = [workspace_id, org_id]

        if status:
            query += ' AND status = ?'
            params.append(status)

        query += ' ORDER BY meeting_datetime DESC, created_at DESC'

        meetings = db_manager.fetch_all(query, tuple(params))

        # Get file count for each meeting
        for meeting in meetings:
            file_count_query = '''
                SELECT COUNT(*) as count FROM meeting_files
                WHERE meeting_id = ? AND org_id = ? AND status = 'uploaded'
            '''
            file_count = db_manager.fetch_one(
                file_count_query,
                (meeting['meeting_id'], org_id)
            )
            meeting['file_count'] = file_count['count'] if file_count else 0

        return jsonify(meetings), 200

    except Exception as e:
        print(f"Error fetching meetings: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/meetings/get-detail', methods=['POST'])
def get_meeting_detail_payload():
    """Get detailed meeting information including extractions using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('meeting_id'):
            return jsonify({'error': 'meeting_id is required'}), 400
            
        meeting_id = data['meeting_id']
        org_id = data.get('org_id', 'default_org')

        # Get meeting basic info
        meeting_query = '''
            SELECT * FROM meetings
            WHERE meeting_id = ? AND org_id = ?
        '''
        meeting = db_manager.fetch_one(meeting_query, (meeting_id, org_id))

        if not meeting:
            return jsonify({'error': 'Meeting not found'}), 404

        # Get meeting files
        files_query = '''
            SELECT * FROM meeting_files
            WHERE meeting_id = ? AND org_id = ? AND status = 'uploaded'
        '''
        files = db_manager.fetch_all(files_query, (meeting_id, org_id))

        # Get all extractions
        extractions = extraction_service.get_meeting_extractions(meeting_id, org_id)

        return jsonify({
            'meeting': meeting,
            'files': files,
            'extractions': extractions
        }), 200

    except Exception as e:
        print(f"Error fetching meeting detail: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/meetings/update', methods=['PUT'])
def update_meeting_payload():
    """Update a meeting using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('meeting_id'):
            return jsonify({'error': 'meeting_id is required'}), 400
            
        meeting_id = data['meeting_id']
        org_id = data.get('org_id', 'default_org')

        # Verify meeting exists
        check_query = 'SELECT * FROM meetings WHERE meeting_id = ? AND org_id = ?'
        existing_meeting = db_manager.fetch_one(check_query, (meeting_id, org_id))

        if not existing_meeting:
            return jsonify({'error': 'Meeting not found'}), 404

        # Build update query dynamically
        update_fields = []
        params = []

        if 'meeting_name' in data:
            update_fields.append('meeting_name = ?')
            params.append(data['meeting_name'])

        if 'stakeholders' in data:
            update_fields.append('stakeholders = ?')
            params.append(data['stakeholders'])

        if 'meeting_datetime' in data:
            update_fields.append('meeting_datetime = ?')
            params.append(data['meeting_datetime'])

        if 'meeting_details' in data:
            update_fields.append('meeting_details = ?')
            params.append(data['meeting_details'])

        if 'status' in data:
            update_fields.append('status = ?')
            params.append(data['status'])

        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400

        update_fields.append('updated_at = ?')
        params.append(datetime.now())
        params.extend([meeting_id, org_id])

        query = f'''
            UPDATE meetings
            SET {', '.join(update_fields)}
            WHERE meeting_id = ? AND org_id = ?
        '''

        db_manager.execute_query(query, tuple(params))

        return jsonify({'message': 'Meeting updated successfully'}), 200

    except Exception as e:
        print(f"Error updating meeting: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/meetings/delete', methods=['DELETE'])
def delete_meeting_payload():
    """Soft delete a meeting using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('meeting_id'):
            return jsonify({'error': 'meeting_id is required'}), 400
            
        meeting_id = data['meeting_id']
        org_id = data.get('org_id', 'default_org')

        # Verify meeting exists
        check_query = 'SELECT * FROM meetings WHERE meeting_id = ? AND org_id = ?'
        existing_meeting = db_manager.fetch_one(check_query, (meeting_id, org_id))

        if not existing_meeting:
            return jsonify({'error': 'Meeting not found'}), 404

        # Soft delete meeting
        query = '''
            UPDATE meetings
            SET status = 'deleted', updated_at = ?
            WHERE meeting_id = ? AND org_id = ?
        '''
        db_manager.execute_query(query, (datetime.now(), meeting_id, org_id))

        # Soft delete associated files
        files_query = '''
            UPDATE meeting_files
            SET status = 'deleted', updated_at = ?
            WHERE meeting_id = ? AND org_id = ?
        '''
        db_manager.execute_query(files_query, (datetime.now(), meeting_id, org_id))

        # Soft delete all extractions
        extraction_tables = [
            'extraction_bu_teams', 'extraction_modules_processes',
            'extraction_licenses', 'extraction_personas',
            'extraction_requirements', 'extraction_risks_issues',
            'extraction_action_items', 'extraction_decisions',
            'extraction_dependencies', 'extraction_pain_points',
            'extraction_current_state', 'extraction_target_state',
            'extraction_integrations', 'extraction_data_migration',
            'extraction_data_model', 'extraction_metadata_updates',
            'extraction_scope_summary', 'extraction_assumptions_gaps',
            'extraction_source_references', 'extraction_validation_summary',
            'extraction_metadata'
        ]

        for table in extraction_tables:
            ext_query = f'''
                UPDATE {table}
                SET status = 'deleted'
                WHERE meeting_id = ? AND org_id = ?
            '''
            db_manager.execute_query(ext_query, (meeting_id, org_id))

        return jsonify({'message': 'Meeting deleted successfully'}), 200

    except Exception as e:
        print(f"Error deleting meeting: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/files/get-by-workspace', methods=['POST'])
def get_meeting_files_by_workspace_payload():
    """Get files by workspace and type using payload"""
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'workspace_id is required'}), 400
            
        workspace_id = data['workspace_id']
        file_type = data.get('file_type', 'meetings')  # Default to 'meetings' for meeting routes
        
        # Get files from unified files table
        files_query = '''
            SELECT * FROM files
            WHERE workspace_id = ? AND file_type = ? AND status != ?
            ORDER BY created_at DESC
        '''
        files = db_manager.fetch_all(files_query, (workspace_id, file_type, 'deleted'))
        
        return jsonify(files), 200

    except Exception as e:
        print(f"Error fetching files: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@meeting_routes.route('/workspaces/<int:workspace_id>/stakeholders', methods=['GET'])
def get_workspace_stakeholders(workspace_id):
    """Get all stakeholders extracted from documents in a workspace"""
    try:
        org_id = request.args.get('org_id', 'default_org')
        
        # Query to get all stakeholders from llm_streams table for this workspace
        query = '''
            SELECT DISTINCT ls.extracted_stakeholders
            FROM llm_streams ls
            JOIN documents d ON ls.document_id = d.document_id
            WHERE d.workspace_id = ? 
            AND ls.extracted_stakeholders IS NOT NULL 
            AND ls.extracted_stakeholders != 'null'
            AND ls.extracted_stakeholders != '[]'
            AND ls.status = 'success'
        '''
        
        results = db_manager.fetch_all(query, (workspace_id,))
        
        # Combine all stakeholders from different documents
        all_stakeholders = []
        for result in results:
            try:
                import json
                stakeholders = json.loads(result['extracted_stakeholders'])
                if isinstance(stakeholders, list):
                    all_stakeholders.extend(stakeholders)
            except (json.JSONDecodeError, TypeError):
                continue
        
        # Remove duplicates based on name and email
        unique_stakeholders = []
        seen = set()
        for stakeholder in all_stakeholders:
            key = f"{stakeholder.get('name', '')}_{stakeholder.get('email', '')}"
            if key not in seen and stakeholder.get('name'):
                seen.add(key)
                unique_stakeholders.append(stakeholder)
        
        return jsonify({
            'stakeholders': unique_stakeholders,
            'count': len(unique_stakeholders)
        })
        
    except Exception as e:
        print(f"Error fetching stakeholders: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
