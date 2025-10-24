from flask import Blueprint, jsonify, request
import os
from database.db_manager import DatabaseManager

llm_bp = Blueprint('llm', __name__)


def get_db():
    db_path = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), '..', 'database', 'ids.db'))
    return DatabaseManager(db_path)


@llm_bp.route('/llm-streams/get-latest', methods=['POST'])
def get_latest_stream_payload():
    try:
        data = request.get_json()
        if not data or not data.get('document_id'):
            return jsonify({'error': 'document_id is required'}), 400
            
        document_id = data['document_id']
        db = get_db()
        
        stream = db.fetch_one(
            '''SELECT * FROM llm_streams 
               WHERE document_id = ? AND status = ?
               ORDER BY created_at DESC LIMIT 1''',
            (document_id, 'success')
        )
        
        if not stream:
            return jsonify({'error': 'No stream found for document'}), 404
        
        return jsonify(stream), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



