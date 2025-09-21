from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from pushup_detection.pushup_processor import PushupProcessor
from pushup_database import PushupDatabase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=['*'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     supports_credentials=True)

# Initialize database
db = PushupDatabase()

# Create uploads directory if it doesn't exist
os.makedirs('uploads', exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'pushup-detection',
        'status': 'healthy'
    })

@app.route('/api/upload-pushup-video', methods=['POST'])
def upload_pushup_video():
    """Upload and process pushup video"""
    try:
        if 'video' not in request.files:
            return jsonify({'success': False, 'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({'success': False, 'error': 'No video file selected'}), 400
        
        # Get user name from form data
        user_name = request.form.get('user_name', 'Anonymous')
        mode = request.form.get('mode', 'standard')
        
        # Save uploaded video
        video_path = os.path.join('uploads', video_file.filename)
        video_file.save(video_path)
        
        logger.info(f"Pushup video uploaded: {video_file.filename}")
        
        # Process video
        processor = PushupProcessor()
        results = processor.process_video(video_path)
        
        # Add user name to results
        results['user_name'] = user_name
        
        # Clean up uploaded file
        try:
            os.remove(video_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        logger.error(f"Error in upload_pushup_video: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/save-pushup-result', methods=['POST'])
def save_pushup_result():
    """Save pushup result to database"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Save to database
        db.save_result(data)
        
        return jsonify({
            'success': True,
            'message': 'Pushup result saved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error saving pushup result: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pushup-leaderboard', methods=['GET'])
def get_pushup_leaderboard():
    """Get pushup leaderboard"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        time_filter = request.args.get('time_filter', 'all')
        mode_filter = request.args.get('mode_filter', 'all')
        sort_by = request.args.get('sort_by', 'counter')
        
        # Get leaderboard data
        leaderboard = db.get_leaderboard(limit=limit, time_filter=time_filter, mode_filter=mode_filter, sort_by=sort_by)
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'data': leaderboard,
            'count': len(leaderboard),
            'stats': stats
        })
        
    except Exception as e:
        logger.error(f"Error getting pushup leaderboard: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)
