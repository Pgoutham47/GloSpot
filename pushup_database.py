import sqlite3
import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class PushupDatabase:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Use persistent storage for production (Vercel)
            if os.environ.get('VERCEL'):
                self.db_path = '/tmp/pushup_results.db'
            else:
                self.db_path = 'pushup_results.db'
        else:
            self.db_path = db_path
        self.connect()
        self.create_table()
    
    def connect(self):
        """Connect to the SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row  # Enable column access by name
            logger.info("Pushup database connected successfully.")
        except sqlite3.Error as e:
            logger.error(f"Error connecting to pushup database: {e}")
            raise
    
    def create_table(self):
        """Create the pushup_results table if it doesn't exist."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS pushup_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_name TEXT NOT NULL,
                    counter INTEGER NOT NULL,
                    position TEXT,
                    total_frames INTEGER,
                    mode TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.commit()
            logger.info("Table 'pushup_results' ensured to exist.")
        except sqlite3.Error as e:
            logger.error(f"Error creating table: {e}")
            raise

    def save_result(self, result: Dict[str, Any]):
        """Save a pushup result to the database."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO pushup_results (user_name, counter, position, total_frames, mode)
                VALUES (?, ?, ?, ?, ?)
            """, (
                result.get('user_name', 'Anonymous'),
                result.get('counter', 0),
                result.get('position'),
                result.get('total_frames'),
                result.get('mode', 'standard')
            ))
            self.conn.commit()
            logger.info(f"Pushup result saved for {result.get('user_name', 'Anonymous')} with {result.get('counter', 0)} pushups.")
        except sqlite3.Error as e:
            logger.error(f"Error saving result: {e}")
            raise

    def get_leaderboard(self, limit: int = 50, time_filter: str = 'all', mode_filter: str = 'all', sort_by: str = 'counter') -> List[Dict[str, Any]]:
        """Retrieve pushup leaderboard data."""
        try:
            cursor = self.conn.cursor()
            query = "SELECT * FROM pushup_results WHERE 1=1"
            params = []

            if mode_filter != 'all':
                query += " AND mode = ?"
                params.append(mode_filter)

            if time_filter == 'day':
                query += " AND timestamp >= ?"
                params.append((datetime.now() - timedelta(days=1)).isoformat())
            elif time_filter == 'week':
                query += " AND timestamp >= ?"
                params.append((datetime.now() - timedelta(weeks=1)).isoformat())
            elif time_filter == 'month':
                query += " AND timestamp >= ?"
                params.append((datetime.now() - timedelta(days=30)).isoformat())

            # Ensure valid sort_by column
            valid_sort_columns = ['counter', 'timestamp']
            if sort_by not in valid_sort_columns:
                sort_by = 'counter'  # Default to counter if invalid

            query += f" ORDER BY {sort_by} DESC LIMIT ?"
            params.append(limit)

            cursor.execute(query, params)
            leaderboard_data = [dict(row) for row in cursor.fetchall()]
            logger.info(f"Retrieved {len(leaderboard_data)} pushup leaderboard entries.")
            return leaderboard_data
        except sqlite3.Error as e:
            logger.error(f"Error getting pushup leaderboard: {e}")
            raise

    def get_stats(self) -> Dict[str, Any]:
        """Retrieve overall statistics for pushup results."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT COUNT(*) as total_tests, MAX(counter) as max_pushups, MIN(counter) as min_pushups, AVG(counter) as average_pushups FROM pushup_results")
            stats = dict(cursor.fetchone())
            
            logger.info(f"Retrieved pushup stats: {stats}")
            return stats
        except sqlite3.Error as e:
            logger.error(f"Error getting pushup stats: {e}")
            raise

    def get_user_results(self, user_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve recent results for a specific user."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM pushup_results WHERE user_name = ? ORDER BY timestamp DESC LIMIT ?", (user_name, limit))
            user_results = [dict(row) for row in cursor.fetchall()]
            logger.info(f"Retrieved {len(user_results)} pushup results for user {user_name}.")
            return user_results
        except sqlite3.Error as e:
            logger.error(f"Error getting user pushup results: {e}")
            raise
