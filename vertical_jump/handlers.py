from tracemalloc import start
import mediapipe as mp
import cv2 as cv
import time
import numpy as np
from . import mapping
import pdb
import logging
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend to avoid threading issues
import matplotlib.pyplot as plt
from datetime import datetime
import csv

class PoseHandler():
    def __init__(self,
                 static_image_mode=False,
                 model_complexity=0,
                 smooth_landmarks=True,
                 enable_segmentation=False,
                 smooth_segmentation=True,
                 min_detection_confidence= 0.5,
                 min_tracking_confidence = 0.95):
        '''
        Initialize the poseDetector
        '''

        self.static_image_mode = static_image_mode
        self.model_complexity = model_complexity
        self.smooth_landmarks = smooth_landmarks
        self.enable_segmentation = enable_segmentation
        self.smooth_segmentation = smooth_segmentation
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence

        self.mpDraw = mp.solutions.drawing_utils
        self.mpPose = mp.solutions.pose
        self.pose = self.mpPose.Pose(self.static_image_mode, self.model_complexity, self.smooth_landmarks, self.enable_segmentation, self.smooth_segmentation, self.min_detection_confidence, self.min_tracking_confidence)


    def findPose(self, img, draw = True):
        '''
        findPose takes in the img you want to find the pose in, and whether or not you
        want to draw the pose (True by default).
        '''
        imgRGB = cv.cvtColor(img, cv.COLOR_BGR2RGB) #convert BGR --> RGB as openCV uses BGR but mediapipe uses RGB
        imgRGB.flags.writeable = False
        self.results = self.pose.process(image = imgRGB)
        if self.results.pose_landmarks and draw: # if there are pose landmarks in our results object and draw was set to True
            self.mpDraw.draw_landmarks(imgRGB, self.results.pose_landmarks, self.mpPose.POSE_CONNECTIONS, self.mpDraw.DrawingSpec(color = (255, 255, 255), thickness = 2, circle_radius = 2), self.mpDraw.DrawingSpec(color = (35, 176, 247), thickness = 2, circle_radius = 2)) #draw them

        return imgRGB #returns the image

    
    def findPosition(self, img, lm_select, draw=True):
        '''
        Takes in the image and returns a list of the landmarks
        '''
        lm_conversions = []
        for element in lm_select: lm_conversions.append(mapping.landmarks[element]) 
        lmList = []
        if self.results.pose_landmarks:
            for id, lm in enumerate(self.results.pose_landmarks.landmark): #for each landmark
                if id in lm_conversions:
                    h, w, c = img.shape #grab the image shape
                    cx, cy = int(lm.x * w), int(lm.y * h) # set cx and cy to the landmark coordinates
                    if cx < 1920 and cy < 1080 and cx > 0 and cy > 0:
                        lmList.append([id, cx, cy]) #append the landmark id, the x coord and the y coord
                    if draw:
                        cv.circle(img, (cx,cy), 10, (255, 0, 0), cv.FILLED) #if we want to draw, then draw
        if draw: return lmList, img
        return lmList #returns the list of landmarks


    def findAngle(self, p1, p2, p3):
        '''
        takes in three points and returns the angle between them
        '''
        self.p1 = np.array(p1) # start point
        self.p2 = np.array(p2) # mid point
        self.p3 = np.array(p3) # end point
        
        radians = np.arctan2(self.p3[2]-self.p2[2], self.p3[1]-self.p2[1]) - np.arctan2(self.p1[2]-self.p2[2], self.p1[1]-self.p2[1]) #trig
        angle = np.abs(radians*180.0/np.pi) 
        
        if angle >180.0:
            angle = 360-angle
            
        return angle
    
    def get_shoulder_value(self, frame):
        self.findPose(frame, draw = False)
        values = self.findPosition(frame, ["left_shoulder", "right_shoulder"], draw=False)
        return values