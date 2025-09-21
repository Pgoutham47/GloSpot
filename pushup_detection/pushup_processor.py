import cv2
import mediapipe as mp
import numpy as np
import logging

logger = logging.getLogger(__name__)

class PushupProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.counter = 0
        self.position = "UP"  # Initial position
        self.total_frames = 0

    def calculate_angle(self, a, b, c):
        a = np.array(a)  # First
        b = np.array(b)  # Mid
        c = np.array(c)  # End
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle

    def process_video(self, video_path):
        self.logger.info(f"Starting pushup video processing for {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        self.counter = 0
        self.position = "UP"
        self.total_frames = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            self.total_frames += 1
            
            # Recolor image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
        
            # Make detection
            results = self.pose.process(image)
        
            # Recolor back to BGR
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Getting landmarks
            try:
                landmarks = results.pose_landmarks.landmark
                
                # Getting coordinates for left arm
                left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                left_elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x,landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                left_wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x,landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                
                # Getting coordinates for right arm
                right_shoulder = [landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                right_elbow = [landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                right_wrist = [landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].x,landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
                
                # Calculating angle (average of both arms)
                angle = (self.calculate_angle(left_shoulder, left_elbow, left_wrist) + \
                        self.calculate_angle(right_shoulder, right_elbow, right_wrist)) / 2
                
                # Pushup counter logic
                if angle > 160:  # Arm is relatively straight (UP position)
                    self.position = "UP"
                if angle < 70 and self.position == 'UP':  # Arm is bent (DOWN position) and was previously UP
                    self.position = "DOWN"
                    self.counter += 1
                    self.logger.info(f"Pushup count: {self.counter}")
                        
            except Exception as e:
                self.logger.warning(f"Error processing frame landmarks: {e}")
                pass  # Continue processing even if landmarks are missed in a frame

        cap.release()
        
        results = {
            'counter': self.counter,
            'position': self.position,
            'total_frames': self.total_frames,
            'mode': 'standard'  # Only one mode for now
        }
        
        self.logger.info(f"Processing complete. Pushups: {results['counter']}")
        return results