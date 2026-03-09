import sqlite3

conn = sqlite3.connect('nolook_dev.db')
c = conn.cursor()

# テーブル確認
c.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = c.fetchall()
print("📋 テーブル一覧:")
for table in tables:
    print(f"  - {table[0]}")

# emotion_logs を確認
print("\n📊 emotion_logs (最新5件):")
c.execute('SELECT student_id, emotion, score, created_at FROM emotion_logs ORDER BY created_at DESC LIMIT 5')
rows = c.fetchall()
if rows:
    print(f"{'学生ID':<20} | {'感情':<10} | {'スコア':<6} | {'作成日時'}")
    print("-" * 70)
    for row in rows:
        print(f"{row[0][:20]:<20} | {row[1]:<10} | {row[2]:.2f} | {row[3]}")
else:
    print("  ⚠️  データがありません")

conn.close()
