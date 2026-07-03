import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'lavarand.db')

def get_connection():
    """Get a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # returns dict-like rows
    return conn

def init_db():
    """
    Create tables if they don't exist.
    Called once on app startup.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # API Keys table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            key         TEXT UNIQUE NOT NULL,
            name        TEXT NOT NULL,
            email       TEXT,
            created_at  TEXT NOT NULL,
            is_active   INTEGER DEFAULT 1,
            request_count INTEGER DEFAULT 0
        )
    ''')

    # Request logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS request_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key     TEXT NOT NULL,
            endpoint    TEXT NOT NULL,
            timestamp   TEXT NOT NULL,
            status      INTEGER NOT NULL
        )
    ''')

    conn.commit()
    conn.close()
    print("[DB] Database initialized")

def create_api_key(key: str, name: str, email: str = None):
    """Insert a new API key into the database"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO api_keys (key, name, email, created_at)
        VALUES (?, ?, ?, ?)
    ''', (key, name, email, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def validate_api_key(key: str) -> bool:
    """Check if an API key exists and is active"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id FROM api_keys
        WHERE key = ? AND is_active = 1
    ''', (key,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

def increment_request_count(key: str):
    """Increment the request count for an API key"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE api_keys
        SET request_count = request_count + 1
        WHERE key = ?
    ''', (key,))
    conn.commit()
    conn.close()

def log_request(api_key: str, endpoint: str, status: int):
    """Log an API request"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO request_logs (api_key, endpoint, timestamp, status)
        VALUES (?, ?, ?, ?)
    ''', (api_key, endpoint, datetime.utcnow().isoformat(), status))
    conn.commit()
    conn.close()

def get_all_keys():
    """Get all API keys (for admin dashboard)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT key, name, email, created_at, is_active, request_count
        FROM api_keys
        ORDER BY created_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_recent_logs(limit: int = 20):
    """Get recent request logs (for admin dashboard)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT api_key, endpoint, timestamp, status
        FROM request_logs
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_key_stats(key: str):
    """Get stats for a specific API key"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT name, email, created_at, request_count
        FROM api_keys WHERE key = ?
    ''', (key,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None