# app/main.py
from dotenv import load_dotenv
load_dotenv(".env", override=True)



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ask import router as ask_router
from app.routes.analyze import router as analyze_router
from app.routes.summary import router as summary_router
from app.routes.export import router as export_router
from app.routes.weekly import router as weekly_router  # 週報

from app.middleware.security import RequestIdMiddleware, ApiKeyMiddleware, RateLimitMiddleware

from app.metrics import router as metrics_router, instrument_request


app = FastAPI(title="NO LOOK API", version="0.5.5")

# CORS（開発用：本番では許可ドメインに絞る推奨）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(RequestIdMiddleware)
app.add_middleware(ApiKeyMiddleware)
app.add_middleware(RateLimitMiddleware)

@app.get("/", tags=["health"])
def health():
    from os import getenv
    return {
        "ok": True,
        "version": app.version,
        "flags": {
            "OPENAI_API_KEY": bool(getenv("OPENAI_API_KEY")),
            "NOLOOK_LLM_MODEL": getenv("NOLOOK_LLM_MODEL", "gpt-4o-mini"),
            "NOLOOK_MANUAL_ONLY": int(getenv("NOLOOK_MANUAL_ONLY", "0")),
        },
    }

# ミドルウェアとして追加（どこか1か所）
@app.middleware("http")
async def _metrics_mw(request, call_next):
    return await instrument_request(request, call_next)

# ルータ配線：router 側に prefix がある前提で、main 側では prefix を付けない
app.include_router(ask_router)
app.include_router(analyze_router, prefix="/analyze", tags=["analyze"])
app.include_router(summary_router, prefix="/summary", tags=["summary"])
app.include_router(export_router,  prefix="/export",  tags=["export"])
app.include_router(weekly_router)
app.include_router(metrics_router)
