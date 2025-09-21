#!/usr/bin/env python3
"""
Test script to verify the vertical jump integration is working
"""

import os
import sys
import logging

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from vertical_jump.mapping import landmarks
        print("✅ mapping.py imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import mapping.py: {e}")
        return False
    
    try:
        from vertical_jump.handlers import PoseHandler
        print("✅ handlers.py imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import handlers.py: {e}")
        return False
    
    try:
        from vertical_jump.calibration_handler import CalibrationHandler
        print("✅ calibration_handler.py imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import calibration_handler.py: {e}")
        return False
    
    try:
        from vertical_jump.vertical_jump_processor import VerticalJumpProcessor
        print("✅ vertical_jump_processor.py imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import vertical_jump_processor.py: {e}")
        return False
    
    return True

def test_dependencies():
    """Test that required dependencies are available"""
    print("\nTesting dependencies...")
    
    dependencies = [
        'mediapipe',
        'cv2',
        'numpy',
        'matplotlib',
        'pandas',
        'flask'
    ]
    
    all_good = True
    for dep in dependencies:
        try:
            __import__(dep)
            print(f"✅ {dep} is available")
        except ImportError:
            print(f"❌ {dep} is not available")
            all_good = False
    
    return all_good

def test_directories():
    """Test that required directories exist or can be created"""
    print("\nTesting directories...")
    
    directories = ['uploads', 'info_exports', 'vertical_jump']
    
    for directory in directories:
        if os.path.exists(directory):
            print(f"✅ {directory} directory exists")
        else:
            try:
                os.makedirs(directory)
                print(f"✅ {directory} directory created")
            except Exception as e:
                print(f"❌ Failed to create {directory} directory: {e}")
                return False
    
    return True

def test_pose_handler():
    """Test that PoseHandler can be instantiated"""
    print("\nTesting PoseHandler...")
    
    try:
        from vertical_jump.handlers import PoseHandler
        handler = PoseHandler()
        print("✅ PoseHandler instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to instantiate PoseHandler: {e}")
        return False

def test_calibration_handler():
    """Test that CalibrationHandler can be instantiated"""
    print("\nTesting CalibrationHandler...")
    
    try:
        from vertical_jump.calibration_handler import CalibrationHandler
        handler = CalibrationHandler()
        print("✅ CalibrationHandler instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to instantiate CalibrationHandler: {e}")
        return False

def test_processor():
    """Test that VerticalJumpProcessor can be instantiated"""
    print("\nTesting VerticalJumpProcessor...")
    
    try:
        from vertical_jump.vertical_jump_processor import VerticalJumpProcessor
        processor = VerticalJumpProcessor()
        print("✅ VerticalJumpProcessor instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to instantiate VerticalJumpProcessor: {e}")
        return False

def main():
    print("🧪 GloSpot Vertical Jump Integration Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_dependencies,
        test_directories,
        test_pose_handler,
        test_calibration_handler,
        test_processor
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The vertical jump integration is ready to use.")
        print("\nNext steps:")
        print("1. Run: python3 start_vertical_jump_backend.py")
        print("2. In another terminal, run: python3 server.py")
        print("3. Open http://localhost:8080 in your browser")
        print("4. Navigate to All Tests > Vertical Jump")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Make sure all dependencies are installed: pip install -r vertical_jump_requirements.txt")
        print("2. Check that all files are in the correct locations")
        print("3. Ensure you have Python 3.7+ installed")

if __name__ == "__main__":
    main()
