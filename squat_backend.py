from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from squat_detection.squat_processor import SquatProcessor
from squat_database import SquatDatabase
import json

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

# Initialize database
db = SquatDatabase()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-squat-video', methods=['POST'])
def upload_squat_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload MP4, MOV, AVI, or MKV files.'}), 400
        
        # Get form data
        user_name = request.form.get('user_name', 'Anonymous')
        mode = request.form.get('mode', 'beginner')  # beginner or pro
        
        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"Squat video uploaded: {filename}")
        
        # Process the video
        processor = SquatProcessor(mode=mode)
        results = processor.process_video(filepath)
        
        # Add user info to results
        results['user_name'] = user_name
        results['timestamp'] = datetime.now().isoformat()
        
        # Results are always successful if we get here (no exception thrown)
        return jsonify({
            'success': True,
            'results': results,
            'message': f'Analysis complete: {results["correct_squats"]} correct, {results["incorrect_squats"]} incorrect squats'
        })
                    
    except Exception as e:
        logger.error(f"Error in upload_squat_video: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-squat-result', methods=['POST'])
def save_squat_result():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['user_name', 'mode', 'correct_squats', 'incorrect_squats', 'total_squats', 'accuracy_percentage']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Add timestamp if not provided
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().isoformat()
        
        # Save to database
        result_id = db.save_result(data)
        
        return jsonify({
            'success': True,
            'message': 'Squat result saved successfully',
            'result_id': result_id
        })
        
    except Exception as e:
        logger.error(f"Error saving squat result: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/squat-leaderboard', methods=['GET'])
def get_squat_leaderboard():
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        time_filter = request.args.get('time_filter', 'all')
        
        # Get leaderboard data
        leaderboard = db.get_leaderboard(limit=limit, time_filter=time_filter)
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'data': leaderboard,
            'count': len(leaderboard),
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting squat leaderboard: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/squat-stats', methods=['GET'])
def get_squat_stats():
    try:
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting squat stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-squat-results/<user_name>', methods=['GET'])
def get_user_squat_results(user_name):
    try:
        limit = request.args.get('limit', 10, type=int)
        results = db.get_user_results(user_name, limit=limit)
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error getting user squat results: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Squat Detection API is running'})

if __name__ == '__main__':
    from datetime import datetime
    app.run(debug=True, host='0.0.0.0', port=5002)
