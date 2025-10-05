# app/main.py（既存に追記）
from fastapi import FastAPI, Request, Response
from app.routes.analyze import router as analyze_router
from app.routes.ask import router as ask_router
from app.routes.summary import router as summary_router
from app.routes.export import router as export_router
from app.routes.metrics import router as metrics_router
from app.metrics import HTTP_REQUESTS_TOTAL

app = FastAPI()

@app.get("/")
def root():
    return {"ok": True}

@app.middleware("http")
async def count_http_requests(request: Request, call_next):
    HTTP_REQUESTS_TOTAL.inc()
    return await call_next(request)

app.include_router(analyze_router)          # /analyze
app.include_router(ask_router)              # /ask
app.include_router(summary_router)          # /summary
app.include_router(export_router)           # /export
app.include_router(metrics_router)          # /metrics
