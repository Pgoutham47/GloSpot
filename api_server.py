from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
import json

# Import all processors and databases
from squat_detection.squat_processor import SquatProcessor
from squat_database import SquatDatabase
from pushup_detection.pushup_processor import PushupProcessor
from pushup_database import PushupDatabase
from height_detection.height_processor import HeightProcessor
from height_database import HeightDatabase
from vertical_jump.vertical_jump_processor import VerticalJumpProcessor
from vertical_jump_database import VerticalJumpDatabase

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize databases
squat_db = SquatDatabase()
pushup_db = PushupDatabase()
height_db = HeightDatabase()
vj_db = VerticalJumpDatabase()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'glospot-unified-api',
        'databases': {
            'squat': 'connected',
            'pushup': 'connected', 
            'height': 'connected',
            'vertical_jump': 'connected'
        }
    })

# SQUAT ENDPOINTS
@app.route('/api/upload-squat-video', methods=['POST'])
def upload_squat_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the video
            processor = SquatProcessor()
            result = processor.process_video(filepath)
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify(result)
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        logger.error(f"Error processing squat video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-squat-result', methods=['POST'])
def save_squat_result():
    try:
        data = request.get_json()
        result_id = squat_db.save_result(data)
        return jsonify({'success': True, 'id': result_id})
    except Exception as e:
        logger.error(f"Error saving squat result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/squat-leaderboard', methods=['GET'])
def get_squat_leaderboard():
    try:
        results = squat_db.get_leaderboard()
        return jsonify({'data': results})
    except Exception as e:
        logger.error(f"Error getting squat leaderboard: {e}")
        return jsonify({'error': str(e)}), 500

# PUSHUP ENDPOINTS
@app.route('/api/upload-pushup-video', methods=['POST'])
def upload_pushup_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the video
            processor = PushupProcessor()
            result = processor.process_video(filepath)
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify(result)
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        logger.error(f"Error processing pushup video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-pushup-result', methods=['POST'])
def save_pushup_result():
    try:
        data = request.get_json()
        result_id = pushup_db.save_result(data)
        return jsonify({'success': True, 'id': result_id})
    except Exception as e:
        logger.error(f"Error saving pushup result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pushup-leaderboard', methods=['GET'])
def get_pushup_leaderboard():
    try:
        results = pushup_db.get_leaderboard()
        return jsonify({'data': results})
    except Exception as e:
        logger.error(f"Error getting pushup leaderboard: {e}")
        return jsonify({'error': str(e)}), 500

# HEIGHT ENDPOINTS
@app.route('/api/upload-height-video', methods=['POST'])
def upload_height_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the video
            processor = HeightProcessor()
            result = processor.process_video(filepath)
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify(result)
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        logger.error(f"Error processing height video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-height-result', methods=['POST'])
def save_height_result():
    try:
        data = request.get_json()
        result_id = height_db.save_result(data)
        return jsonify({'success': True, 'id': result_id})
    except Exception as e:
        logger.error(f"Error saving height result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/height-leaderboard', methods=['GET'])
def get_height_leaderboard():
    try:
        results = height_db.get_leaderboard()
        return jsonify({'data': results})
    except Exception as e:
        logger.error(f"Error getting height leaderboard: {e}")
        return jsonify({'error': str(e)}), 500

# VERTICAL JUMP ENDPOINTS
@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process the video
            processor = VerticalJumpProcessor()
            result = processor.process_video(filepath)
            
            # Clean up the uploaded file
            os.remove(filepath)
            
            return jsonify(result)
        else:
            return jsonify({'error': 'Invalid file type'}), 400
            
    except Exception as e:
        logger.error(f"Error processing vertical jump video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-vertical-jump-result', methods=['POST'])
def save_vertical_jump_result():
    try:
        data = request.get_json()
        result_id = vj_db.save_result(data)
        return jsonify({'success': True, 'id': result_id})
    except Exception as e:
        logger.error(f"Error saving vertical jump result: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/vertical-jump-leaderboard', methods=['GET'])
def get_vertical_jump_leaderboard():
    try:
        results = vj_db.get_leaderboard()
        return jsonify({'data': results})
    except Exception as e:
        logger.error(f"Error getting vertical jump leaderboard: {e}")
        return jsonify({'error': str(e)}), 500

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(os.path.join('static', path)):
        return send_file(os.path.join('static', path))
    return send_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
