#!/usr/bin/env python3
"""
Startup script for the Height Detection Backend
"""

import subprocess
import sys
import os

def main():
    """Start the height detection backend server."""
    print("Starting Height Detection Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('height_backend.py'):
        print("Error: height_backend.py not found. Please run this script from the GloSpot directory.")
        sys.exit(1)
    
    # Check if virtual environment exists
    venv_path = './mp_env'
    if not os.path.exists(venv_path):
        print("Error: Virtual environment not found. Please run setup first.")
        sys.exit(1)
    
    # Activate virtual environment and start the server
    if os.name == 'nt':  # Windows
        activate_script = os.path.join(venv_path, 'Scripts', 'activate.bat')
        python_exe = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:  # Unix/Linux/macOS
        activate_script = os.path.join(venv_path, 'bin', 'activate')
        python_exe = os.path.join(venv_path, 'bin', 'python')
    
    try:
        print(f"Using Python: {python_exe}")
        print("Starting Flask server on http://localhost:5003")
        print("Press Ctrl+C to stop the server")
        print("=" * 50)
        
        # Start the Flask application
        subprocess.run([python_exe, 'height_backend.py'], check=True)
        
    except KeyboardInterrupt:
        print("\nShutting down Height Detection Backend...")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
