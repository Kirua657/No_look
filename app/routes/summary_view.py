from __future__ import annotations
from fastapi import APIRouter

router = APIRouter(prefix="/summary_view", tags=["summary"])

@router.get("")
def summary_view_root():
    # TODO: 本実装に差し替え
    return {"status": "ok", "message": "summary_view stub"}