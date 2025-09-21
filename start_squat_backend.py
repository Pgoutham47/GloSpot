#!/usr/bin/env python3
"""
Startup script for the Squat Detection Backend
"""

import os
import sys
import subprocess
import time

def install_requirements():
    """Install required packages using the mp_env virtual environment"""
    print("📦 Installing squat detection requirements...")
    
    # Use the mp_env virtual environment if it exists
    if os.path.exists('./mp_env/bin/pip'):
        pip_path = './mp_env/bin/pip'
        python_path = './mp_env/bin/python'
    else:
        pip_path = 'pip3'
        python_path = 'python3'
    
    try:
        subprocess.run([pip_path, 'install', '-r', 'squat_requirements.txt'], check=True)
        print("✅ Requirements installed successfully!")
        return python_path
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return None

def create_directories():
    """Create necessary directories"""
    print("📁 Creating necessary directories...")
    
    directories = ['uploads']
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created directory: {directory}")
        else:
            print(f"📁 Directory already exists: {directory}")

def start_backend(python_path):
    """Start the squat detection backend server"""
    print("🚀 Starting Squat Detection Backend...")
    print("📍 Backend will be available at: http://localhost:5002")
    print("🔗 Health check: http://localhost:5002/api/health")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([python_path, 'squat_backend.py'], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")

def main():
    print("🏋️ Squat Detection Backend Startup")
    print("=" * 50)
    
    # Install requirements
    python_path = install_requirements()
    if not python_path:
        print("❌ Failed to install requirements. Exiting.")
        return
    
    # Create directories
    create_directories()
    
    # Start backend
    start_backend(python_path)

if __name__ == "__main__":
    main()
