import sqlite3
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Use persistent storage for production (Vercel)
if os.environ.get('VERCEL'):
    DATABASE_FILE = '/tmp/squat_results.db'
else:
    DATABASE_FILE = 'squat_results.db'

class SquatDatabase:
    def __init__(self):
        self.conn = None
        self.connect()
        self.create_table()

    def connect(self):
        try:
            self.conn = sqlite3.connect(DATABASE_FILE, check_same_thread=False)
            logger.info("Squat database connected successfully.")
        except sqlite3.Error as e:
            logger.error(f"Error connecting to squat database: {e}")
            raise

    def create_table(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS squat_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_name TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    correct_squats INTEGER NOT NULL,
                    incorrect_squats INTEGER NOT NULL,
                    total_squats INTEGER NOT NULL,
                    accuracy_percentage REAL NOT NULL,
                    timestamp TEXT NOT NULL
                )
            ''')
            self.conn.commit()
            logger.info("Table 'squat_results' ensured to exist.")
        except sqlite3.Error as e:
            logger.error(f"Error creating squat table: {e}")
            raise

    def save_result(self, result_data):
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO squat_results (user_name, mode, correct_squats, incorrect_squats, total_squats, accuracy_percentage, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                result_data['user_name'],
                result_data['mode'],
                result_data['correct_squats'],
                result_data['incorrect_squats'],
                result_data['total_squats'],
                result_data['accuracy_percentage'],
                result_data['timestamp']
            ))
            self.conn.commit()
            logger.info(f"Squat result saved for {result_data['user_name']} with {result_data['correct_squats']} correct squats.")
            return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(f"Error saving squat result: {e}")
            raise

    def get_leaderboard(self, limit=50, time_filter='all'):
        try:
            cursor = self.conn.cursor()
            query = "SELECT user_name, mode, correct_squats, incorrect_squats, total_squats, accuracy_percentage, timestamp FROM squat_results"
            params = []

            if time_filter == 'week':
                one_week_ago = (datetime.now() - timedelta(weeks=1)).isoformat()
                query += " WHERE timestamp >= ?"
                params.append(one_week_ago)
            elif time_filter == 'month':
                one_month_ago = (datetime.now() - timedelta(days=30)).isoformat()
                query += " WHERE timestamp >= ?"
                params.append(one_month_ago)
            
            # Sort by correct squats first, then by accuracy
            query += " ORDER BY correct_squats DESC, accuracy_percentage DESC LIMIT ?"
            params.append(limit)

            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            leaderboard = []
            for row in rows:
                leaderboard.append({
                    'user_name': row[0],
                    'mode': row[1],
                    'correct_squats': row[2],
                    'incorrect_squats': row[3],
                    'total_squats': row[4],
                    'accuracy_percentage': row[5],
                    'timestamp': row[6]
                })
            logger.info(f"Retrieved {len(leaderboard)} squat leaderboard entries.")
            return leaderboard
        except sqlite3.Error as e:
            logger.error(f"Error getting squat leaderboard: {e}")
            raise

    def get_stats(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT COUNT(*), MAX(correct_squats), AVG(accuracy_percentage) FROM squat_results")
            count, max_squats, avg_accuracy = cursor.fetchone()
            stats = {
                'total_tests': count if count else 0,
                'max_squats': max_squats if max_squats else 0,
                'average_accuracy': avg_accuracy if avg_accuracy else 0.0
            }
            logger.info(f"Retrieved squat stats: {stats}")
            return stats
        except sqlite3.Error as e:
            logger.error(f"Error getting squat stats: {e}")
            raise

    def get_user_results(self, user_name, limit=10):
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                SELECT mode, correct_squats, incorrect_squats, total_squats, accuracy_percentage, timestamp 
                FROM squat_results 
                WHERE user_name = ? 
                ORDER BY timestamp DESC LIMIT ?
            ''', (user_name, limit))
            rows = cursor.fetchall()
            
            user_results = []
            for row in rows:
                user_results.append({
                    'mode': row[0],
                    'correct_squats': row[1],
                    'incorrect_squats': row[2],
                    'total_squats': row[3],
                    'accuracy_percentage': row[4],
                    'timestamp': row[5]
                })
            logger.info(f"Retrieved {len(user_results)} squat results for user {user_name}.")
            return user_results
        except sqlite3.Error as e:
            logger.error(f"Error getting user squat results: {e}")
            raise

    def close(self):
        if self.conn:
            self.conn.close()
            logger.info("Squat database connection closed.")

if __name__ == '__main__':
    # Example usage
    db = SquatDatabase()
    
    # Add some dummy data for testing
    # db.save_result({
    #     'user_name': 'Alice', 
    #     'mode': 'beginner', 
    #     'correct_squats': 15, 
    #     'incorrect_squats': 3, 
    #     'total_squats': 18, 
    #     'accuracy_percentage': 83.33, 
    #     'timestamp': datetime.now().isoformat()
    # })
    
    # print("\nSquat Leaderboard (All Time):")
    # print(db.get_leaderboard())
    
    # print("\nSquat Stats:")
    # print(db.get_stats())

    # print("\nAlice's Squat Results:")
    # print(db.get_user_results('Alice'))
    
    db.close()
