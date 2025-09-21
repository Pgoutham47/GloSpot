import os
import sys
import logging
import json
from .calibration_handler import CalibrationHandler

class VerticalJumpProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
    def process_video(self, video_path, jumper_name="Ben", jumper_height=72, jump_style=0, vid_format=0):
        """
        Process a vertical jump video and return the results
        This follows the exact same workflow as the original VertMeasure application
        """
        try:
            # Create calibration handler with exact same parameters as original
            handler = CalibrationHandler(
                source_name=video_path,
                jumper_name=jumper_name,
                jumper_height=jumper_height,
                jump_style=jump_style,
                vid_format=vid_format,
                log=self.logger
            )
            
            # Follow the exact same workflow as the original application
            self.logger.info("Starting video processing workflow...")
            
            # Step 1: Generate video points (pose detection)
            self.logger.info("Step 1: Generating video points...")
            handler.generate_video_points()
            
            # Step 2: Define joint averages
            self.logger.info("Step 2: Defining joint averages...")
            handler.define_joint_averages()
            
            # Step 3: Define stages (find launch point)
            self.logger.info("Step 3: Defining stages...")
            handler.define_stages()
            
            # Step 4: Get reference values (calibration)
            self.logger.info("Step 4: Getting reference values...")
            handler.get_reference_values()
            
            # Step 5: Estimate heights based on jump style
            if jump_style == 0:  # Ground-based
                self.logger.info("Step 5: Estimating head height (ground-based)...")
                handler.estimate_head_height()
                # Calibrate with measured height (no offsets for now)
                handler.calibrate_measured_height(0, 0, 0)
            else:  # Rim-based
                self.logger.info("Step 5: Estimating rim height (rim-based)...")
                handler.estimate_rim_height()
                # Calibrate with measured height (no offsets for now)
                handler.calibrate_measured_height(0, 0, 0)
            
            # Step 6: Calculate vertical jump
            self.logger.info("Step 6: Calculating vertical jump...")
            vertical_jump = handler.calculate_vertical_jump()
            
            # Step 7: Measure descent speed
            self.logger.info("Step 7: Measuring descent speed...")
            descent_level, descent_speed, ground_time = handler.measure_descent_speed()
            
            # Step 8: Export results
            self.logger.info("Step 8: Exporting results...")
            handler.export_jump_info()
            
            # Prepare results
            results = {
                'jumper_name': jumper_name,
                'vertical_jump_inches': round(vertical_jump, 2),
                'descent_speed_ips': round(descent_speed, 2),
                'descent_level_inches': round(descent_level, 2),
                'ground_time_s': round(ground_time, 2),
                'jump_style': 'Ground-based' if jump_style == 0 else 'Rim-based',
                'video_format': 'HD (1920x1080)' if vid_format == 1 else 'Standard (720x960)',
                'pixels_per_inch': round(handler.pixels_per_inch, 2),
                'launch_frame': handler.launch_frame_number,
                'landing_frame': handler.land_frame_number,
                'total_frames': handler.frame_count
            }
            
            self.logger.info(f"Processing complete. Vertical jump: {vertical_jump:.2f} inches")
            return results
            
        except Exception as e:
            self.logger.error(f"Error processing video: {str(e)}")
            raise e