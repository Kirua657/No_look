import sqlite3
from datetime import datetime, timezone, timedelta

conn = sqlite3.connect('nolook_dev.db')
c = conn.cursor()

JST = timezone(timedelta(hours=9))
now = datetime.now(timezone.utc)
today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
today_end = today_start + timedelta(days=1)

print("📋 テーブル一覧:")
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
for table in c.fetchall():
    print(f"  - {table[0]}")

print("\n📊 全 emotion_logs データ（作成日時が今日のもの）:")
c.execute('''
    SELECT id, student_id, emotion, score, created_at 
    FROM emotion_logs 
    WHERE created_at >= ? AND created_at <= ?
    ORDER BY created_at DESC
''', (today_start, today_end))

rows = c.fetchall()
if rows:
    print(f"{'ID':<5} | {'学生ID':<20} | {'感情':<10} | {'スコア':<6} | {'作成日時':<30}")
    print("-" * 95)
    for row in rows:
        print(f"{row[0]:<5} | {row[1][:20]:<20} | {row[2]:<10} | {row[3]:.2f} | {row[4]:<30}")
    print(f"\n✅ 今日のレコード数: {len(rows)}")
else:
    print("  ⚠️  今日のデータなし")
    print("\n📊 最新10件（今日以外も含む）:")
    c.execute('SELECT id, student_id, emotion, created_at FROM emotion_logs ORDER BY created_at DESC LIMIT 10')
    for row in c.fetchall():
        print(f"  ID:{row[0]} | {row[1][:20]} | {row[2]} | {row[3]}")

conn.close()
