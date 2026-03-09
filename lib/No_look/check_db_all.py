import sqlite3
from datetime import datetime, timezone, timedelta

conn = sqlite3.connect('nolook_dev.db')
c = conn.cursor()

print("📋 テーブル一覧:")
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
for table in c.fetchall():
    print(f"  - {table[0]}")

print("\n📊 すべての emotion_logs:")
c.execute('SELECT id, student_id, emotion, score, created_at FROM emotion_logs ORDER BY created_at DESC LIMIT 20')

rows = c.fetchall()
if rows:
    print(f"{'ID':<5} | {'学生ID':<20} | {'感情':<10} | {'スコア':<6} | {'作成日時':<30}")
    print("-" * 95)
    for row in rows:
        print(f"{row[0]:<5} | {row[1][:20]:<20} | {row[2]:<10} | {row[3]:.2f} | {row[4]:<30}")
    print(f"\n✅ 合計レコード数: {len(rows)}")
else:
    print("  ⚠️  データなし")

conn.close()
