from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from height_detection.height_processor import HeightProcessor
from height_database import HeightDatabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     supports_credentials=True)

# Initialize database
db = HeightDatabase()

# Create uploads directory if it doesn't exist
os.makedirs('uploads', exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'height-detection'})

@app.route('/api/upload-height-video', methods=['POST'])
def upload_height_video():
    """Upload and process height measurement video."""
    try:
        if 'video' not in request.files:
            return jsonify({'success': False, 'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'success': False, 'error': 'No video file selected'}), 400
        
        # Get additional parameters
        user_name = request.form.get('user_name', 'Anonymous')
        mode = request.form.get('mode', 'standard')
        
        # Save uploaded video
        video_filename = f"height_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{video_file.filename}"
        video_path = os.path.join('uploads', video_filename)
        video_file.save(video_path)
        
        logger.info(f"Height video uploaded: {video_filename}")
        
        # Process video
        processor = HeightProcessor()
        result = processor.process_video(video_path)
        
        if not result['success']:
            # Clean up uploaded file
            if os.path.exists(video_path):
                os.remove(video_path)
            return jsonify({'success': False, 'error': result['error']}), 400
        
        # Add user info to result
        result['user_name'] = user_name
        result['mode'] = mode
        result['timestamp'] = datetime.now().isoformat()
        
        # Clean up uploaded file
        if os.path.exists(video_path):
            os.remove(video_path)
        
        return jsonify({
            'success': True,
            'results': result
        })
        
    except Exception as e:
        logger.error(f"Error in upload_height_video: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/save-height-result', methods=['POST'])
def save_height_result():
    """Save height measurement result to database."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['user_name', 'height_cm', 'height_ft']
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
            'message': 'Height result saved successfully',
            'result_id': result_id
        })
        
    except Exception as e:
        logger.error(f"Error saving height result: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/height-leaderboard', methods=['GET'])
def get_height_leaderboard():
    """Get height measurement leaderboard."""
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
        logger.error(f"Error getting height leaderboard: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-height-results/<user_name>', methods=['GET'])
def get_user_height_results(user_name):
    """Get height measurement results for a specific user."""
    try:
        limit = request.args.get('limit', 10, type=int)
        results = db.get_user_results(user_name, limit=limit)
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error getting user height results: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
