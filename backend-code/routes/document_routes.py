from flask import Blueprint, request, jsonify, current_app
import uuid
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from database.db_manager import DatabaseManager
from services.llm_service import LLMService
from services.document_processor import DocumentProcessor

document_bp = Blueprint('documents', __name__)


def get_db():
    db_path = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db'))
    return DatabaseManager(db_path)


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@document_bp.route('/documents/upload', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        workspace_id = request.form.get('workspace_id')
        document_type = request.form.get('document_type', 'SOW')
        
        if not workspace_id:
            return jsonify({'error': 'Workspace ID is required'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        db = get_db()
        workspace = db.fetch_one(
            'SELECT * FROM workspaces WHERE workspace_id = ? AND status = ?',
            (workspace_id, 'active')
        )
        
        if not workspace:
            return jsonify({'error': 'Workspace not found'}), 404
        
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        # Read file content and store in database
        file_content = file.read()
        file_size = len(file_content)
        file.seek(0)  # Reset file pointer for potential future use

        # Insert into unified files table with file content
        db.execute_query(
            '''INSERT INTO files 
               (workspace_id, file_type, file_name, 
                storage_path, file_content, file_extension, file_size, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (workspace_id, 'workspace', filename,
             'database_stored', file_content, file_extension, file_size, 'uploaded', 
             datetime.utcnow(), datetime.utcnow())
        )
        
        # Get the auto-generated file_id
        file_record = db.fetch_one(
            'SELECT file_id FROM files ORDER BY file_id DESC LIMIT 1'
        )
        file_id = file_record['file_id']
        
        # Also insert into documents table for backward compatibility
        db.execute_query(
            '''INSERT INTO documents 
               (workspace_id, document_type, file_name, 
                storage_path, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (workspace_id, document_type, filename,
             'database_stored', 'uploaded', datetime.utcnow(), datetime.utcnow())
        )
        
        # Get the auto-generated document_id
        document_record = db.fetch_one(
            'SELECT document_id FROM documents ORDER BY document_id DESC LIMIT 1'
        )
        document_id = document_record['document_id']
        
        document = db.fetch_one(
            'SELECT * FROM documents WHERE document_id = ?',
            (document_id,)
        )
        
        return jsonify(document), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@document_bp.route('/documents/process', methods=['POST'])
def process_document_payload():
    try:
        data = request.get_json()
        if not data or not data.get('document_id'):
            return jsonify({'error': 'document_id is required'}), 400
            
        document_id = data['document_id']
        db = get_db()
        
        document = db.fetch_one(
            'SELECT * FROM documents WHERE document_id = ? AND status != ?',
            (document_id, 'deleted')
        )
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        # Check if document is legacy (old format without content)
        if document['status'] == 'legacy':
            return jsonify({
                'error': 'Legacy document cannot be processed',
                'details': 'This document was uploaded before the new storage system. Please re-upload the file to process it.',
                'requires_reupload': True
            }), 400
        
        # Get file content from files table
        # First try to find a file with content stored in database
        file_record = db.fetch_one(
            '''SELECT file_content, file_extension FROM files 
               WHERE workspace_id = ? AND file_name = ? AND status != ? 
               AND storage_path = ? AND file_content IS NOT NULL''',
            (document['workspace_id'], document['file_name'], 'deleted', 'database_stored')
        )
        
        if not file_record or not file_record['file_content']:
            # If no file with content found, check if there are any files with this name
            all_files = db.fetch_all(
                '''SELECT file_id, file_name, storage_path, file_content FROM files 
                   WHERE workspace_id = ? AND file_name = ? AND status != ?''',
                (document['workspace_id'], document['file_name'], 'deleted')
            )
            
            if all_files:
                # Log what files were found for debugging
                print(f"Found {len(all_files)} files with name '{document['file_name']}':")
                for f in all_files:
                    print(f"  - File ID {f['file_id']}: storage_path='{f['storage_path']}', has_content={'Yes' if f['file_content'] else 'No'}")
            
            return jsonify({
                'error': 'File content not found in database',
                'details': f"No file with content found for '{document['file_name']}' in workspace {document['workspace_id']}"
            }), 404
        
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('processing', datetime.utcnow(), document_id)
        )
        
        doc_processor = DocumentProcessor()
        extracted_text = doc_processor.extract_text(
            file_record['file_content'], 
            file_record['file_extension']
        )
        
        if not extracted_text:
            db.execute_query(
                'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
                ('failed', datetime.utcnow(), document_id)
            )
            return jsonify({'error': 'Failed to extract text from document'}), 500
        
        llm_service = LLMService()
        start_time = datetime.utcnow()
        
        # Get the messages array from LLM service (we need to modify LLM service to return this)
        # For now, we'll construct it manually
        prompt = llm_service._build_sow_extraction_prompt()
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": extracted_text}
        ]
        
        response_data = llm_service.extract_sow_insights(extracted_text)
        
        end_time = datetime.utcnow()
        latency_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Extract stakeholders from the response data
        extracted_stakeholders = None
        try:
            import json
            response_json = json.loads(response_data)
            stakeholders_list = []
            
            # Extract stakeholders from business_units
            if 'business_units' in response_json:
                for bu in response_json['business_units']:
                    if 'stakeholders' in bu:
                        for stakeholder in bu['stakeholders']:
                            stakeholder_info = {
                                'name': stakeholder.get('name', ''),
                                'designation': stakeholder.get('designation', ''),
                                'email': stakeholder.get('email', ''),
                                'business_unit': bu.get('business_unit_name', '')
                            }
                            stakeholders_list.append(stakeholder_info)
            
            # Convert to JSON string for storage
            if stakeholders_list:
                extracted_stakeholders = json.dumps(stakeholders_list, indent=2)
                
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            print(f"Error extracting stakeholders: {str(e)}")
            extracted_stakeholders = None
        
        # Store messages array in request_payload and response content in response_payload
        db.execute_query(
            '''INSERT INTO llm_streams 
               (document_id, request_payload, response_payload, extracted_stakeholders,
                tokens_used, latency_ms, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (document_id, json.dumps(messages), 
             response_data, extracted_stakeholders, 0, latency_ms, 'success',
             datetime.utcnow(), datetime.utcnow())
        )
        
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('completed', datetime.utcnow(), document_id)
        )
        
        stream = db.fetch_one(
            'SELECT * FROM llm_streams WHERE document_id = ? ORDER BY stream_id DESC LIMIT 1',
            (document_id,)
        )
        
        return jsonify(stream), 200
    except Exception as e:
        db = get_db()
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('failed', datetime.utcnow(), document_id)
        )
        return jsonify({'error': str(e)}), 500


@document_bp.route('/documents/get-by-id', methods=['POST'])
def get_document_payload():
    try:
        data = request.get_json()
        if not data or not data.get('document_id'):
            return jsonify({'error': 'document_id is required'}), 400
            
        document_id = data['document_id']
        db = get_db()
        document = db.fetch_one(
            'SELECT * FROM documents WHERE document_id = ? AND status != ?',
            (document_id, 'deleted')
        )
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify(document), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@document_bp.route('/documents/get-by-workspace', methods=['POST'])
def get_documents_by_workspace_payload():
    try:
        data = request.get_json()
        if not data or not data.get('workspace_id'):
            return jsonify({'error': 'workspace_id is required'}), 400
            
        workspace_id = data['workspace_id']
        db = get_db()
        documents = db.fetch_all(
            '''SELECT * FROM documents 
               WHERE workspace_id = ? AND status != ?
               ORDER BY created_at DESC''',
            (workspace_id, 'deleted')
        )
        
        return jsonify(documents), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@document_bp.route('/files/get-by-workspace', methods=['POST'])
def get_files_by_workspace_payload():
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

