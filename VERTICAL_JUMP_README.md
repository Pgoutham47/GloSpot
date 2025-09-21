# Vertical Jump Integration - GloSpot App

This document explains how to use the integrated vertical jump testing functionality in the GloSpot app.

## Overview

The vertical jump functionality has been integrated from the VertMeasure project into the GloSpot app. It allows users to upload videos of their vertical jumps and get AI-powered analysis of their jump height and other metrics.

## Features

- **Video Upload**: Upload MP4, MOV, AVI, or MKV video files
- **AI Analysis**: Uses MediaPipe for pose detection and analysis
- **Multiple Metrics**: Measures vertical jump height, descent speed, descent level, and ground time
- **CSV Export**: Download detailed results as CSV files
- **Results Storage**: Save results to the app's leaderboard system

## Setup Instructions

### 1. Install Dependencies

Run the startup script to install all required dependencies:

```bash
python3 start_vertical_jump_backend.py
```

Or manually install:

```bash
pip install -r vertical_jump_requirements.txt
```

### 2. Start the Backend Server

The backend server needs to be running for video processing:

```bash
python3 vertical_jump_backend.py
```

The server will start on `http://localhost:5000`

### 3. Start the Frontend

In a separate terminal, start the main GloSpot app:

```bash
python3 server.py
```

The app will be available at `http://localhost:8080`

## How to Use

### 1. Access the Vertical Jump Test

1. Open the GloSpot app in your browser
2. Navigate to "All Tests" from the bottom navigation
3. Click on the "Vertical Jump" test card

### 2. Record Your Jump Video

**Important Tips for Best Results:**
- Stand with your side to the camera
- Ensure your entire body is visible in the frame
- Perform a standing vertical jump (no running start)
- Use good lighting
- Keep the camera steady
- Record in a clear background

### 3. Upload and Configure

1. Upload your jump video using the drag-and-drop area or file picker
2. Enter your name and height in inches
3. Select the reference point:
   - **Ground Reference**: For jumps measured from the ground
   - **Rim Reference**: For basketball rim-based measurements
4. Select video format (Vertical/Portrait or Landscape)

### 4. Process the Video

1. Click "Process Video"
2. Wait for the AI analysis to complete (may take a few minutes)
3. View your results including:
   - Vertical jump height in inches
   - Descent speed
   - Descent level
   - Ground contact time

### 5. Save and Export

1. **Download CSV**: Get detailed results as a CSV file
2. **Save Result**: Add your result to the app's leaderboard and your profile

## Technical Details

### Backend Architecture

- **Flask Server**: Handles video uploads and processing
- **MediaPipe**: AI pose detection and analysis
- **OpenCV**: Video processing and frame analysis
- **Pandas**: Data processing and CSV generation

### File Structure

```
GloSpot/
├── vertical_jump/
│   ├── mapping.py              # MediaPipe landmark mappings
│   ├── handlers.py             # Pose detection handlers
│   ├── calibration_handler.py  # Video analysis logic
│   └── vertical_jump_processor.py # Main processing class
├── vertical_jump_backend.py    # Flask API server
├── vertical_jump_requirements.txt # Python dependencies
└── start_vertical_jump_backend.py # Setup script
```

### API Endpoints

- `POST /api/upload-video` - Upload and process video
- `GET /api/get-results/<jumper_name>` - Get results for a jumper
- `GET /api/download-csv/<jumper_name>` - Download CSV results
- `GET /api/health` - Health check

## Troubleshooting

### Common Issues

1. **"Backend server not running" error**
   - Make sure `python3 vertical_jump_backend.py` is running
   - Check that port 5000 is available

2. **Video processing fails**
   - Ensure video format is supported (MP4, MOV, AVI, MKV)
   - Check that the person is clearly visible in the video
   - Try with better lighting or different camera angle

3. **Dependencies not installing**
   - Make sure you have Python 3.7+ installed
   - Try using `pip3` instead of `pip`
   - On some systems, you may need to install system dependencies for OpenCV

4. **Poor measurement accuracy**
   - Ensure the person's entire body is visible
   - Use a side view of the jump
   - Make sure the camera is stable
   - Enter accurate height measurements

### System Requirements

- Python 3.7 or higher
- At least 4GB RAM (for video processing)
- Modern web browser with JavaScript enabled
- Camera for recording jump videos

## Performance Notes

- Video processing can take 1-5 minutes depending on video length and system performance
- Larger video files will take longer to process
- The system works best with videos under 100MB
- Processing is done locally on your machine

## Data Privacy

- All video processing is done locally on your machine
- Videos are temporarily stored in the `uploads` folder during processing
- Results are stored locally in your browser's localStorage
- No data is sent to external servers

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the Python console for backend errors
3. Ensure all dependencies are properly installed
4. Try with a different video file
5. Restart both the backend and frontend servers

## Future Enhancements

Potential improvements for future versions:
- Real-time video processing
- Multiple jump analysis
- Comparison with previous results
- Integration with fitness tracking devices
- Cloud processing options
- Mobile app version
