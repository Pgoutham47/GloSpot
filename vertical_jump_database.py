import sqlite3
import os
from datetime import datetime
import logging

class VerticalJumpDatabase:
    def __init__(self, db_path=None):
        if db_path is None:
            # Use persistent storage for production (Vercel)
            if os.environ.get('VERCEL'):
                self.db_path = '/tmp/vertical_jump_results.db'
            else:
                self.db_path = 'vertical_jump_results.db'
        else:
            self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        self.init_database()
    
    def init_database(self):
        """Initialize the database with the required tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create vertical jump results table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS vertical_jump_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    jumper_name TEXT NOT NULL,
                    jumper_height REAL NOT NULL,
                    vertical_jump_height REAL NOT NULL,
                    descent_speed REAL NOT NULL,
                    descent_level REAL NOT NULL,
                    ground_time REAL NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create index for faster queries
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_vertical_jump_height 
                ON vertical_jump_results(vertical_jump_height DESC)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_timestamp 
                ON vertical_jump_results(timestamp DESC)
            ''')
            
            conn.commit()
            conn.close()
            self.logger.info("Database initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing database: {e}")
            raise
    
    def save_result(self, result_data):
        """Save a vertical jump result to the database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO vertical_jump_results 
                (jumper_name, jumper_height, vertical_jump_height, descent_speed, descent_level, ground_time, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                result_data['jumper_name'],
                result_data['jumper_height'],
                result_data['height'],
                result_data['descent_speed'],
                result_data['descent_level'],
                result_data['ground_time'],
                result_data['timestamp']
            ))
            
            conn.commit()
            result_id = cursor.lastrowid
            conn.close()
            
            self.logger.info(f"Saved vertical jump result with ID: {result_id}")
            return result_id
            
        except Exception as e:
            self.logger.error(f"Error saving result: {e}")
            raise
    
    def get_leaderboard(self, limit=50, time_filter='all'):
        """Get the leaderboard sorted by vertical jump height"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build query based on time filter
            if time_filter == 'week':
                cursor.execute('''
                    SELECT * FROM vertical_jump_results 
                    WHERE timestamp >= datetime('now', '-7 days')
                    ORDER BY vertical_jump_height DESC 
                    LIMIT ?
                ''', (limit,))
            elif time_filter == 'month':
                cursor.execute('''
                    SELECT * FROM vertical_jump_results 
                    WHERE timestamp >= datetime('now', '-30 days')
                    ORDER BY vertical_jump_height DESC 
                    LIMIT ?
                ''', (limit,))
            else:  # all time
                cursor.execute('''
                    SELECT * FROM vertical_jump_results 
                    ORDER BY vertical_jump_height DESC 
                    LIMIT ?
                ''', (limit,))
            
            results = cursor.fetchall()
            conn.close()
            
            # Convert to list of dictionaries
            leaderboard = []
            for row in results:
                leaderboard.append({
                    'id': row[0],
                    'jumper_name': row[1],
                    'jumper_height': row[2],
                    'height': row[3],
                    'descent_speed': row[4],
                    'descent_level': row[5],
                    'ground_time': row[6],
                    'timestamp': row[7],
                    'created_at': row[8]
                })
            
            self.logger.info(f"Retrieved {len(leaderboard)} leaderboard entries")
            return leaderboard
            
        except Exception as e:
            self.logger.error(f"Error getting leaderboard: {e}")
            raise
    
    def get_user_results(self, jumper_name, limit=10):
        """Get results for a specific user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM vertical_jump_results 
                WHERE jumper_name = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (jumper_name, limit))
            
            results = cursor.fetchall()
            conn.close()
            
            # Convert to list of dictionaries
            user_results = []
            for row in results:
                user_results.append({
                    'id': row[0],
                    'jumper_name': row[1],
                    'jumper_height': row[2],
                    'height': row[3],
                    'descent_speed': row[4],
                    'descent_level': row[5],
                    'ground_time': row[6],
                    'timestamp': row[7],
                    'created_at': row[8]
                })
            
            return user_results
            
        except Exception as e:
            self.logger.error(f"Error getting user results: {e}")
            raise
    
    def get_stats(self):
        """Get overall statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get total count
            cursor.execute('SELECT COUNT(*) FROM vertical_jump_results')
            total_tests = cursor.fetchone()[0]
            
            # Get average height
            cursor.execute('SELECT AVG(vertical_jump_height) FROM vertical_jump_results')
            avg_height = cursor.fetchone()[0] or 0
            
            # Get best height
            cursor.execute('SELECT MAX(vertical_jump_height) FROM vertical_jump_results')
            best_height = cursor.fetchone()[0] or 0
            
            # Get unique users
            cursor.execute('SELECT COUNT(DISTINCT jumper_name) FROM vertical_jump_results')
            unique_users = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'total_tests': total_tests,
                'average_height': round(avg_height, 2),
                'best_height': round(best_height, 2),
                'unique_users': unique_users
            }
            
        except Exception as e:
            self.logger.error(f"Error getting stats: {e}")
            raise
