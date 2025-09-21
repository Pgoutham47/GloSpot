#!/usr/bin/env python3
"""
Startup script for the Vertical Jump Backend
This script will install dependencies and start the Flask server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        # Use the virtual environment if it exists
        venv_python = "./mp_env/bin/python"
        if os.path.exists(venv_python):
            print("Using existing virtual environment...")
            subprocess.check_call([venv_python, "-m", "pip", "install", "-r", "vertical_jump_requirements.txt"])
        else:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "vertical_jump_requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'info_exports']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")

def start_server():
    """Start the Flask server"""
    print("Starting Vertical Jump Backend Server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Use the virtual environment if it exists
        venv_python = "./mp_env/bin/python"
        if os.path.exists(venv_python):
            print("Using virtual environment Python...")
            subprocess.run([venv_python, "vertical_jump_backend.py"])
        else:
            from vertical_jump_backend import app
            app.run(debug=True, host='0.0.0.0', port=5000)
    except ImportError as e:
        print(f"❌ Error importing backend: {e}")
        print("Make sure all files are in the correct location")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    print("🚀 GloSpot Vertical Jump Backend Setup")
    print("=" * 50)
    
    # Create directories
    create_directories()
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install dependencies. Please check the requirements file.")
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
