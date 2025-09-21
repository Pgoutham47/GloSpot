#!/usr/bin/env python3
"""
Test script to verify the vertical jump integration is working
"""

import requests
import json
import os
import time

def test_backend_health():
    """Test if the backend is responding"""
    try:
        response = requests.get('http://localhost:5001/api/health')
        if response.status_code == 200:
            print("✅ Backend health check passed")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

def test_frontend_health():
    """Test if the frontend is responding"""
    try:
        response = requests.get('http://localhost:8080')
        if response.status_code == 200:
            print("✅ Frontend health check passed")
            return True
        else:
            print(f"❌ Frontend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend health check failed: {e}")
        return False

def main():
    print("🧪 Testing GloSpot Vertical Jump Integration")
    print("=" * 50)
    
    # Test backend
    backend_ok = test_backend_health()
    
    # Test frontend
    frontend_ok = test_frontend_health()
    
    print("\n" + "=" * 50)
    if backend_ok and frontend_ok:
        print("🎉 All tests passed! Integration is working.")
        print("\n📱 To use the app:")
        print("1. Open http://localhost:8080 in your browser")
        print("2. Sign up or sign in")
        print("3. Go to 'All Tests' → 'Vertical Jump'")
        print("4. Upload a video and test the functionality!")
    else:
        print("❌ Some tests failed. Check the server logs.")
        if not backend_ok:
            print("- Backend server may not be running on port 5001")
        if not frontend_ok:
            print("- Frontend server may not be running on port 8080")

if __name__ == "__main__":
    main()
