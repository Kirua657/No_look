# app/metrics.py
import time
from fastapi import APIRouter, Request, Response
from prometheus_client import (
    Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
)

router = APIRouter()

# ====== 基本メトリクス ======
HTTP_REQUESTS = Counter(
    "nolik_http_requests_total", "HTTP requests total",
    ["method", "path", "status"]
)
HTTP_LATENCY = Histogram(
    "nolik_http_request_seconds", "HTTP request latency (s)",
    ["method", "path"],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10)
)
INPROGRESS = Gauge("nolik_inprogress_requests", "Inprogress HTTP requests")

# （任意）最終感情の分布をカウントしたい時に使う用
EMOTION_TOTAL = Counter(
    "nolik_analyze_label_total", "Analyze result count per emotion",
    ["emotion"]
)

@router.get("/metrics")
def metrics():
    """Prometheus エクスポジション"""
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

async def instrument_request(request: Request, call_next):
    """HTTPミドルウェアで計測"""
    if request.url.path == "/metrics":
        return await call_next(request)  # 自己観測は除外
    method = request.method
    path = request.url.path
    start = time.perf_counter()
    INPROGRESS.inc()
    try:
        response = await call_next(request)
        status = str(response.status_code)
        HTTP_REQUESTS.labels(method=method, path=path, status=status).inc()
        return response
    finally:
        INPROGRESS.dec()
        dur = time.perf_counter() - start
        HTTP_LATENCY.labels(method=method, path=path).observe(dur)
