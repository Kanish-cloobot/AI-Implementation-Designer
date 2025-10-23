from flask import Blueprint, jsonify
import os
from database.db_manager import DatabaseManager

llm_bp = Blueprint('llm', __name__)


def get_db():
    db_path = os.getenv('DATABASE_PATH', './database/ids.db')
    return DatabaseManager(db_path)


@llm_bp.route('/llm-streams/document/<document_id>/latest', methods=['GET'])
def get_latest_stream(document_id):
    try:
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


@llm_bp.route('/llm-streams/<stream_id>', methods=['GET'])
def get_stream(stream_id):
    try:
        db = get_db()
        stream = db.fetch_one(
            'SELECT * FROM llm_streams WHERE stream_id = ?',
            (stream_id,)
        )
        
        if not stream:
            return jsonify({'error': 'Stream not found'}), 404
        
        return jsonify(stream), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

