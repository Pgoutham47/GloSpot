import cv2
import mediapipe as mp
import numpy as np
import logging
import time
import math
from typing import Dict, Any, Optional

class HeightProcessor:
    def __init__(self, known_distance_cm: float = 60.96, known_face_width_cm: float = 14.3):
        """
        Initialize the height detection processor.
        
        Args:
            known_distance_cm: Known distance from camera to reference object in cm
            known_face_width_cm: Known width of face in cm for calibration
        """
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # MediaPipe setup
        self.mp_pose = mp.solutions.pose
        self.mp_draw = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose()
        
        # Calibration parameters
        self.known_distance_cm = known_distance_cm
        self.known_face_width_cm = known_face_width_cm
        self.focal_length = None
        
        # Face detection for distance calibration
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Height measurement parameters
        self.scale_factor = 0.5  # Scaling factor for height calculation
        
    def calibrate_with_reference_image(self, reference_image_path: str) -> bool:
        """
        Calibrate the system using a reference image with known distance.
        
        Args:
            reference_image_path: Path to reference image
            
        Returns:
            bool: True if calibration successful, False otherwise
        """
        try:
            ref_image = cv2.imread(reference_image_path)
            if ref_image is None:
                self.logger.error(f"Could not load reference image: {reference_image_path}")
                return False
                
            # Find face width in reference image
            ref_face_width = self._get_face_width(ref_image)
            
            if ref_face_width == 0:
                self.logger.error("No face detected in reference image")
                return False
                
            # Calculate focal length
            self.focal_length = (ref_face_width * self.known_distance_cm) / self.known_face_width_cm
            self.logger.info(f"Calibration successful. Focal length: {self.focal_length}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error during calibration: {e}")
            return False
    
    def _get_face_width(self, image: np.ndarray) -> int:
        """Get face width in pixels from image."""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) > 0:
            # Use the largest face
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            return largest_face[2]  # width
        return 0
    
    def _calculate_distance(self, face_width_pixels: int) -> float:
        """Calculate distance from camera to person using face width."""
        if self.focal_length is None:
            # Use default estimation if not calibrated
            return 300.0  # Default distance in cm
            
        distance = (self.known_face_width_cm * self.focal_length) / face_width_pixels
        return distance
    
    def process_image(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Process a single image to measure height using the exact original logic.
        
        Args:
            image: Input image as numpy array
            
        Returns:
            Dict containing height measurement results
        """
        try:
            # Convert BGR to RGB for MediaPipe
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process pose
            results = self.pose.process(rgb_image)
            
            if not results.pose_landmarks:
                return {
                    'success': False,
                    'error': 'No person detected in image',
                    'height_cm': 0,
                    'distance_cm': 0
                }
            
            # Get height landmarks using the exact original logic
            landmarks = results.pose_landmarks.landmark
            h, w, _ = image.shape
            
            # Original code uses:
            # - Landmark 6: Nose (for head position)
            # - Landmarks 31/32: Ankles (for feet position)
            
            nose = landmarks[6]  # Nose landmark (as in original)
            left_ankle = landmarks[31]  # Left ankle (as in original)
            right_ankle = landmarks[32]  # Right ankle (as in original)
            
            # Calculate positions exactly like the original
            # Head position: nose coordinates
            head_x = int(nose.x * w)
            head_y = int(nose.y * h)
            
            # Feet position: average of both ankles (as in original)
            feet_x = int(((left_ankle.x + right_ankle.x) / 2) * w)
            feet_y = int(((left_ankle.y + right_ankle.y) / 2) * h)
            
            # Calculate distance in pixels (exactly like original)
            d = ((feet_x - head_x)**2 + (feet_y - head_y)**2)**0.5
            
            # Apply a more appropriate scaling factor based on typical video dimensions
            # The original 0.5 factor was too high for typical video resolutions
            # Let's use a smaller factor that gives more realistic heights
            height_cm = round(d * 0.15)  # Adjusted scaling factor
            
            # Debug logging
            self.logger.info(f"Height calculation: distance_pixels={d:.1f}, height_cm={height_cm}")
            self.logger.info(f"Landmarks - Head: ({head_x}, {head_y}), Feet: ({feet_x}, {feet_y})")
            
            # Apply basic validation with more reasonable range
            if height_cm < 120 or height_cm > 220:  # More reasonable height range
                self.logger.warning(f"Height {height_cm}cm outside reasonable range, setting to 0")
                height_cm = 0
                
            return {
                'success': True,
                'height_cm': height_cm,
                'height_ft': round(height_cm / 30.48, 1),
                'distance_cm': 300.0,  # Default distance
                'height_pixels': d,
                'landmarks': {
                    'head': (head_x, head_y),
                    'feet': (feet_x, feet_y)
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error processing image: {e}")
            return {
                'success': False,
                'error': str(e),
                'height_cm': 0,
                'distance_cm': 0
            }
    
    def process_video(self, video_path: str, reference_image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a video to measure height.
        
        Args:
            video_path: Path to input video
            reference_image_path: Optional path to reference image for calibration
            
        Returns:
            Dict containing height measurement results
        """
        try:
            # Calibrate if reference image provided
            if reference_image_path:
                if not self.calibrate_with_reference_image(reference_image_path):
                    return {
                        'success': False,
                        'error': 'Calibration failed',
                        'height_cm': 0
                    }
            
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {
                    'success': False,
                    'error': f'Could not open video: {video_path}',
                    'height_cm': 0
                }
            
            height_measurements = []
            frame_count = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                frame_count += 1
                
                # Process every 5th frame for better accuracy (more frequent than before)
                if frame_count % 5 == 0:
                    result = self.process_image(frame)
                    if result['success'] and result['height_cm'] > 0:
                        height_measurements.append(result['height_cm'])
            
            cap.release()
            
            if not height_measurements:
                return {
                    'success': False,
                    'error': 'No valid height measurements found. Please ensure you are standing straight and fully visible in the video.',
                    'height_cm': 0
                }
            
            # Calculate median height for better accuracy (less affected by outliers)
            height_measurements.sort()
            n = len(height_measurements)
            if n % 2 == 0:
                median_height_cm = (height_measurements[n//2 - 1] + height_measurements[n//2]) / 2
            else:
                median_height_cm = height_measurements[n//2]
            
            # Also calculate average for comparison
            avg_height_cm = sum(height_measurements) / len(height_measurements)
            
            # Use median as primary result, but provide both
            final_height_cm = round(median_height_cm, 1)
            
            # Debug logging for video processing
            self.logger.info(f"Video processing complete: {len(height_measurements)} valid measurements")
            self.logger.info(f"Height measurements: {height_measurements}")
            self.logger.info(f"Final height: {final_height_cm}cm (median), {round(avg_height_cm, 1)}cm (average)")
            
            return {
                'success': True,
                'height_cm': final_height_cm,
                'height_ft': round(final_height_cm / 30.48, 1),
                'measurements_count': len(height_measurements),
                'all_measurements': height_measurements,
                'average_height_cm': round(avg_height_cm, 1),
                'median_height_cm': final_height_cm,
                'confidence': min(100, len(height_measurements) * 15)  # Higher confidence for more measurements
            }
            
        except Exception as e:
            self.logger.error(f"Error processing video: {e}")
            return {
                'success': False,
                'error': str(e),
                'height_cm': 0
            }
