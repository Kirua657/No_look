#!/usr/bin/env python
import sqlite3
import json

conn = sqlite3.connect('emotion_logs.db')
c = conn.cursor()

# 最新10件を取得
c.execute("SELECT id, student_id, emotion, confidence, labels, created_at FROM emotion_logs ORDER BY id DESC LIMIT 10")
rows = c.fetchall()

print("\n" + "="*100)
print("【最新10件のレコード】")
print("="*100)

for r in rows:
    id_val = r[0]
    student_id = r[1]
    emotion = r[2]
    confidence = r[3]
    labels_json = r[4]
    created_at = r[5]
    
    labels = json.loads(labels_json) if labels_json else {}
    
    print(f"\nID: {id_val}")
    print(f"  Student: {student_id}")
    print(f"  Emotion: {emotion}")
    print(f"  Confidence: {confidence:.2f}")
    print(f"  Labels: {labels}")
    print(f"  Created: {created_at}")

# 今日のレコード数
c.execute("SELECT COUNT(*) FROM emotion_logs WHERE DATE(created_at) = DATE('now')")
today_count = c.fetchone()[0]
print(f"\n\n【今日のレコード数】: {today_count}")

conn.close()
