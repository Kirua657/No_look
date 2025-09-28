# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ask import router as ask_router
from app.routes.analyze import router as analyze_router
from app.routes.summary import router as summary_router
from app.routes.export import router as export_router
# 週報があるなら:
# from app.routes.weekly_report import router as weekly_router

app = FastAPI(title="NO LOOK API", version="0.5.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/", tags=["health"])
def health():
    return {"message": "OK", "version": app.version}

# ルータを prefix 付きで配線（ルータ側は @router.get("") / @router.post("") のままでOK）
app.include_router(ask_router,     prefix="/ask",     tags=["ask"])
app.include_router(analyze_router, prefix="/analyze", tags=["analyze"])
app.include_router(summary_router, prefix="/summary", tags=["summary"])
app.include_router(export_router,  prefix="/export",  tags=["export"])
# 週報があるなら:
# app.include_router(weekly_router, prefix="/weekly_report", tags=["weekly"])
