from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from vertical_jump.vertical_jump_processor import VerticalJumpProcessor
from vertical_jump_database import VerticalJumpDatabase
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
db = VerticalJumpDatabase()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload MP4, MOV, AVI, or MKV files.'}), 400
        
        # Get form data
        jumper_name = request.form.get('jumper_name', 'Anonymous')
        jumper_height = float(request.form.get('jumper_height', 72))
        jump_style = int(request.form.get('jump_style', 0))  # 0 = ground, 1 = rim
        vid_format = int(request.form.get('vid_format', 0))  # 0 = vertical, 1 = landscape
        
        # Save the file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"Video uploaded: {filename}")
        
        # Process the video
        processor = VerticalJumpProcessor()
        results = processor.process_video(
            video_path=filepath,
            jumper_name=jumper_name,
            jumper_height=jumper_height,
            jump_style=jump_style,
            vid_format=vid_format
        )
        
        # Results are always successful if we get here (no exception thrown)
        return jsonify({
            'success': True,
            'results': results,
            'message': f'Vertical jump height: {results["vertical_jump_inches"]:.2f} inches'
        })
            
    except Exception as e:
        logger.error(f"Error in upload_video: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-results/<jumper_name>', methods=['GET'])
def get_results(jumper_name):
    try:
        processor = VerticalJumpProcessor()
        csv_data = processor.get_csv_results(jumper_name)
        
        if csv_data:
            return jsonify({
                'success': True,
                'data': csv_data
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No results found for this jumper'
            }), 404
            
    except Exception as e:
        logger.error(f"Error in get_results: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-csv/<jumper_name>', methods=['GET'])
def download_csv(jumper_name):
    try:
        # Look for the most recent CSV file for this jumper
        csv_files = [f for f in os.listdir('info_exports') if f.endswith('.csv') and jumper_name in f]
        
        if not csv_files:
            return jsonify({'error': 'No CSV file found'}), 404
        
        # Get the most recent file
        latest_csv = sorted(csv_files)[-1]
        csv_path = os.path.join('info_exports', latest_csv)
        
        return send_file(csv_path, as_attachment=True, download_name=latest_csv)
        
    except Exception as e:
        logger.error(f"Error in download_csv: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save-vertical-jump-result', methods=['POST'])
def save_vertical_jump_result():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['jumper_name', 'height', 'descent_speed', 'descent_level', 'ground_time']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Save to database
        result_id = db.save_result(data)
        
        return jsonify({
            'success': True,
            'message': 'Result saved successfully',
            'result_id': result_id
        })
        
    except Exception as e:
        logger.error(f"Error saving result: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vertical-jump-leaderboard', methods=['GET'])
def get_vertical_jump_leaderboard():
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        time_filter = request.args.get('time_filter', 'all')
        
        # Get leaderboard data
        leaderboard = db.get_leaderboard(limit=limit, time_filter=time_filter)
        
        return jsonify({
            'success': True,
            'data': leaderboard,
            'count': len(leaderboard)
        })
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/vertical-jump-stats', methods=['GET'])
def get_vertical_jump_stats():
    try:
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-results/<jumper_name>', methods=['GET'])
def get_user_results(jumper_name):
    try:
        limit = request.args.get('limit', 10, type=int)
        results = db.get_user_results(jumper_name, limit=limit)
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error getting user results: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Vertical Jump API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
