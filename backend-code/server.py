import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database.db_manager import DatabaseManager
from routes.workspace_routes import workspace_bp
from routes.document_routes import document_bp
from routes.llm_routes import llm_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['DATABASE_PATH'] = os.getenv('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'database', 'ids.db'))
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', './uploads')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db_manager = DatabaseManager(app.config['DATABASE_PATH'])
db_manager.initialize_database()

app.register_blueprint(workspace_bp, url_prefix='/api')
app.register_blueprint(document_bp, url_prefix='/api')
app.register_blueprint(llm_bp, url_prefix='/api')


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

