#!/usr/bin/env python3
import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "nolik.db")
print(f"📁 Database path: {db_path}")
print(f"📁 Exists: {os.path.exists(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # テーブル一覧
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = c.fetchall()
    print(f"\n📋 Tables: {[t[0] for t in tables]}")
    
    # emotion_logs テーブルが存在したらデータを取得
    if tables and any('emotion' in t[0] for t in tables):
        c.execute("SELECT id, student_id, emotion, created_at FROM emotion_logs ORDER BY id DESC LIMIT 10")
        rows = c.fetchall()
        print(f"\n✅ Latest 10 emotion_logs records:")
        for row in rows:
            print(f"  {row}")
    
    conn.close()
else:
    print("❌ Database file not found")
