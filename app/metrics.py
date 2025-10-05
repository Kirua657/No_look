# app/metrics.py
from prometheus_client import Counter

# HTTPの総数カウンタ（テストがこれの存在をチェック）
HTTP_REQUESTS_TOTAL = Counter("nolik_http_requests_total", "Total HTTP requests")

# 感情イベントのカウンタ（/analyze 内で try インクリメント）
EMOTION_TOTAL = Counter("nolik_emotion_created", "Emotion created counter", ["emotion"])
