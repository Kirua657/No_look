# app/routes/weekly_ascii.py
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.routes.weekly import weekly_report as _weekly

router = APIRouter(prefix="/weekly_report", tags=["weekly"])

@router.get("/ascii", response_class=PlainTextResponse)
def weekly_ascii(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    data = _weekly(days=days, tz=tz, class_id=class_id, db=db)

    ascii_pretty = None
    if hasattr(data, "ascii_pretty"):
        ascii_pretty = getattr(data, "ascii_pretty")
    elif isinstance(data, dict):
        ascii_pretty = data.get("ascii_pretty")

    # list で来た場合も考慮
    if isinstance(ascii_pretty, list):
        ascii_pretty = "\n".join(str(x) for x in ascii_pretty)

    return ascii_pretty or "（ascii_pretty なし）"
