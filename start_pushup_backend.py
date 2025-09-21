#!/usr/bin/env python3
"""
Startup script for the Pushup Detection Backend
"""

import subprocess
import sys
import os

def main():
    """Start the pushup detection backend server"""
    
    # Check if we're in the right directory
    if not os.path.exists('pushup_backend.py'):
        print("Error: pushup_backend.py not found. Please run this script from the GloSpot directory.")
        sys.exit(1)
    
    # Check if virtual environment exists
    venv_path = './mp_env'
    if not os.path.exists(venv_path):
        print("Error: Virtual environment not found. Please run setup_environment.py first.")
        sys.exit(1)
    
    # Activate virtual environment and start the server
    if os.name == 'nt':  # Windows
        python_path = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:  # Unix/Linux/macOS
        python_path = os.path.join(venv_path, 'bin', 'python')
    
    if not os.path.exists(python_path):
        print(f"Error: Python executable not found at {python_path}")
        sys.exit(1)
    
    print("Starting Pushup Detection Backend...")
    print("Server will be available at: http://localhost:5004")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start the Flask server
        subprocess.run([python_path, 'pushup_backend.py'], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
