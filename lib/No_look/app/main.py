# -*- coding: utf-8 -*-
# app/main.py
from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
import os
from fastapi.middleware.cors import CORSMiddleware  # ★ CORS

# ====== ルータインポート ======
from app.routes.ask import router as ask_router
from app.routes.analyze import router as analyze_router
from app.routes.summary import router as summary_router
from app.routes.summary_view import router as summary_view_router
from app.routes.export import router as export_router
from app.routes.metrics import router as metrics_router
from app.routes.teacher_dashboard import router as teacher_dashboard_router
from app.routes.weekly import router as weekly_report_router  # ★ weekly_report
from app.routes.weekly_view import router as weekly_view_router
from app.routes.weekly_ascii import router as weekly_ascii_router
# from app.routes.weekly_ascii import router as weekly_ascii_router  # ← 廃止

# ====== メトリクス / DB ======
from app.metrics import HTTP_REQUESTS_TOTAL
from app.core.db import init_db

# ====== lifespan（startup/shutdown置き換え） ======
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- startup 相当 ----
    # DB初期化（存在しないテーブル自動CREATEなど）
    init_db()
    yield
    # ---- shutdown 相当 ----
    # いまは特に無し（必要になったらここにクローズ処理等を追加）

# ====== FastAPI本体 ======
app = FastAPI(
    title="NO LOOK API",
    version="1.0.0",
    description="感情ログの解析・教師ダッシュボード用API",
    lifespan=lifespan,
)

# ====== CORS設定 ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),  # 例: http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== ミドルウェア：HTTPリクエスト数カウント ======
@app.middleware("http")
async def count_http_requests(request: Request, call_next):
    HTTP_REQUESTS_TOTAL.inc()
    return await call_next(request)

# ====== ルータ登録 ======
app.include_router(ask_router)
app.include_router(analyze_router)
app.include_router(summary_router)
app.include_router(summary_view_router)
app.include_router(export_router)
app.include_router(metrics_router)
app.include_router(teacher_dashboard_router)
app.include_router(weekly_report_router)
app.include_router(weekly_view_router)
app.include_router(weekly_ascii_router)
# app.include_router(weekly_ascii_router)  # ← 廃止

# ====== ヘルスチェック ======
@app.get("/")
def root():
    return {"ok": True, "version": "1.0.0"}
