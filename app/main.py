# app/main.py
from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware  # ★ CORS追加

# ====== ルータインポート ======
from app.routes.ask import router as ask_router
from app.routes.analyze import router as analyze_router
from app.routes.summary import router as summary_router
from app.routes.export import router as export_router
from app.routes.metrics import router as metrics_router
from app.routes.teacher_dashboard import router as teacher_dashboard_router
from app.routes.weekly import router as weekly_report_router  # ★ weekly_report 追加

# ====== メトリクス / DB ======
from app.metrics import HTTP_REQUESTS_TOTAL
from app.core.db import init_db

# ====== FastAPI本体 ======
app = FastAPI(
    title="NO LOOK API",
    version="1.0.0",
    description="感情ログの解析・教師ダッシュボード用API",
)

# ====== CORS設定 ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),  # 環境変数で指定（例: http://localhost:3000）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== 起動時にDB初期化 ======
@app.on_event("startup")
def startup_event():
    init_db()  # emotion_logs などが存在しない場合、自動CREATE

# ====== ミドルウェア：HTTPリクエスト数カウント ======
@app.middleware("http")
async def count_http_requests(request: Request, call_next):
    HTTP_REQUESTS_TOTAL.inc()
    return await call_next(request)

# ====== ルータ登録 ======
app.include_router(ask_router)
app.include_router(analyze_router)
app.include_router(summary_router)
app.include_router(export_router)
app.include_router(metrics_router)
app.include_router(teacher_dashboard_router)
app.include_router(weekly_report_router)

# ====== ヘルスチェック ======
@app.get("/")
def root():
    return {"ok": True, "version": "1.0.0"}
