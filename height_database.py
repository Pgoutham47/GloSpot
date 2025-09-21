import sqlite3
import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class HeightDatabase:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Use persistent storage for production (Vercel)
            if os.environ.get('VERCEL'):
                self.db_path = '/tmp/height_results.db'
            else:
                self.db_path = 'height_results.db'
        else:
            self.db_path = db_path
        self.connect()
        self.create_table()
    
    def connect(self):
        """Connect to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row  # Enable column access by name
            logger.info("Height database connected successfully.")
        except sqlite3.Error as e:
            logger.error(f"Error connecting to height database: {e}")
            raise
    
    def create_table(self):
        """Create the height_results table if it doesn't exist."""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS height_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_name TEXT NOT NULL,
                    height_cm REAL NOT NULL,
                    height_ft REAL NOT NULL,
                    distance_cm REAL,
                    confidence INTEGER,
                    measurements_count INTEGER,
                    timestamp TEXT NOT NULL,
                    mode TEXT DEFAULT 'standard'
                )
            ''')
            self.conn.commit()
            logger.info("Table 'height_results' ensured to exist.")
        except sqlite3.Error as e:
            logger.error(f"Error creating height results table: {e}")
            raise
    
    def save_result(self, result_data: Dict[str, Any]) -> int:
        """Save a height measurement result to the database."""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO height_results 
                (user_name, height_cm, height_ft, distance_cm, confidence, measurements_count, timestamp, mode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                result_data['user_name'],
                result_data['height_cm'],
                result_data['height_ft'],
                result_data.get('distance_cm', 0),
                result_data.get('confidence', 0),
                result_data.get('measurements_count', 1),
                result_data.get('timestamp', datetime.now().isoformat()),
                result_data.get('mode', 'standard')
            ))
            self.conn.commit()
            logger.info(f"Height result saved for {result_data['user_name']} with height {result_data['height_cm']}cm.")
            return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Error saving height result: {e}")
            raise
    
    def get_leaderboard(self, limit: int = 50, time_filter: str = 'all') -> List[Dict[str, Any]]:
        """Get height measurement leaderboard."""
        try:
            cursor = self.conn.cursor()
            query = "SELECT user_name, height_cm, height_ft, distance_cm, confidence, measurements_count, timestamp, mode FROM height_results"
            params = []
            
            if time_filter == 'week':
                one_week_ago = (datetime.now() - timedelta(weeks=1)).isoformat()
                query += " WHERE timestamp >= ?"
                params.append(one_week_ago)
            elif time_filter == 'month':
                one_month_ago = (datetime.now() - timedelta(days=30)).isoformat()
                query += " WHERE timestamp >= ?"
                params.append(one_month_ago)
            
            # Sort by height (tallest first)
            query += " ORDER BY height_cm DESC LIMIT ?"
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            leaderboard = []
            for row in rows:
                leaderboard.append({
                    'user_name': row[0],
                    'height_cm': row[1],
                    'height_ft': row[2],
                    'distance_cm': row[3],
                    'confidence': row[4],
                    'measurements_count': row[5],
                    'timestamp': row[6],
                    'mode': row[7]
                })
            logger.info(f"Retrieved {len(leaderboard)} height leaderboard entries.")
            return leaderboard
        except sqlite3.Error as e:
            logger.error(f"Error getting height leaderboard: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """Get height measurement statistics."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT COUNT(*), AVG(height_cm), MAX(height_cm), MIN(height_cm) FROM height_results")
            count, avg_height, max_height, min_height = cursor.fetchone()
            
            stats = {
                'total_tests': count if count else 0,
                'average_height_cm': round(avg_height, 1) if avg_height else 0.0,
                'average_height_ft': round(avg_height / 30.48, 1) if avg_height else 0.0,
                'max_height_cm': max_height if max_height else 0,
                'min_height_cm': min_height if min_height else 0,
                'max_height_ft': round(max_height / 30.48, 1) if max_height else 0.0,
                'min_height_ft': round(min_height / 30.48, 1) if min_height else 0.0
            }
            logger.info(f"Retrieved height stats: {stats}")
            return stats
        except sqlite3.Error as e:
            logger.error(f"Error getting height stats: {e}")
            raise
    
    def get_user_results(self, user_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent results for a specific user."""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT user_name, height_cm, height_ft, distance_cm, confidence, measurements_count, timestamp, mode 
                FROM height_results 
                WHERE user_name = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (user_name, limit))
            
            rows = cursor.fetchall()
            results = []
            for row in rows:
                results.append({
                    'user_name': row[0],
                    'height_cm': row[1],
                    'height_ft': row[2],
                    'distance_cm': row[3],
                    'confidence': row[4],
                    'measurements_count': row[5],
                    'timestamp': row[6],
                    'mode': row[7]
                })
            return results
        except sqlite3.Error as e:
            logger.error(f"Error getting user height results: {e}")
            raise
    
    def close(self):
        """Close the database connection."""
        if hasattr(self, 'conn'):
            self.conn.close()
            logger.info("Height database connection closed.")
