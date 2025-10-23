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
        workspace_id = request.args.get('workspace_id')
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
        
        document_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        storage_filename = f"{document_id}.{file_extension}"
        
        upload_folder = current_app.config.get('UPLOAD_FOLDER', './uploads')
        os.makedirs(upload_folder, exist_ok=True)
        storage_path = os.path.join(upload_folder, storage_filename)
        
        file.save(storage_path)
        
        db.execute_query(
            '''INSERT INTO documents 
               (document_id, workspace_id, document_type, file_name, 
                storage_path, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (document_id, workspace_id, document_type, filename,
             storage_path, 'uploaded', datetime.utcnow(), datetime.utcnow())
        )
        
        document = db.fetch_one(
            'SELECT * FROM documents WHERE document_id = ?',
            (document_id,)
        )
        
        return jsonify(document), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@document_bp.route('/documents/<document_id>/process', methods=['POST'])
def process_document(document_id):
    try:
        db = get_db()
        
        document = db.fetch_one(
            'SELECT * FROM documents WHERE document_id = ? AND status != ?',
            (document_id, 'deleted')
        )
        
        if not document:
            return jsonify({'error': 'Document not found'}), 404
        
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('processing', datetime.utcnow(), document_id)
        )
        
        doc_processor = DocumentProcessor()
        extracted_text = doc_processor.extract_text(document['storage_path'])
        
        if not extracted_text:
            db.execute_query(
                'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
                ('failed', datetime.utcnow(), document_id)
            )
            return jsonify({'error': 'Failed to extract text from document'}), 500
        
        llm_service = LLMService()
        start_time = datetime.utcnow()
        
        response_data = llm_service.extract_sow_insights(extracted_text)
        
        end_time = datetime.utcnow()
        latency_ms = int((end_time - start_time).total_seconds() * 1000)
        
        stream_id = str(uuid.uuid4())
        
        db.execute_query(
            '''INSERT INTO llm_streams 
               (stream_id, document_id, request_payload, response_payload,
                tokens_used, latency_ms, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (stream_id, document_id, extracted_text[:1000], 
             response_data, 0, latency_ms, 'success',
             datetime.utcnow(), datetime.utcnow())
        )
        
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('completed', datetime.utcnow(), document_id)
        )
        
        stream = db.fetch_one(
            'SELECT * FROM llm_streams WHERE stream_id = ?',
            (stream_id,)
        )
        
        return jsonify(stream), 200
    except Exception as e:
        db = get_db()
        db.execute_query(
            'UPDATE documents SET status = ?, updated_at = ? WHERE document_id = ?',
            ('failed', datetime.utcnow(), document_id)
        )
        return jsonify({'error': str(e)}), 500


@document_bp.route('/documents/<document_id>', methods=['GET'])
def get_document(document_id):
    try:
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


@document_bp.route('/documents/workspace/<workspace_id>', methods=['GET'])
def get_documents_by_workspace(workspace_id):
    try:
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

