from __future__ import annotations
from fastapi import APIRouter, Query, Depends, Response
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.routes.weekly import _calc_weekly, EMOTIONS

router = APIRouter(prefix="/weekly_ascii", tags=["weekly"])

def _totals(daily):
    t = {e:0 for e in EMOTIONS}
    for d in daily:
        for k,v in d["counts"].items():
            if k in t: t[k] += int(v)
    return t

@router.get("")
def weekly_ascii(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    base = _calc_weekly(db, days=days, tz=tz, class_id=class_id)
    totals = _totals(base["daily"])
    total = sum(totals.values()) or 1
    lines = [f"[{class_id or '-'} / {base['start_date']}..{base['end_date']}]"]
    for e in EMOTIONS:
        cnt = totals[e]; pct = int(round(cnt*100/total))
        bar = "█" * (pct // 5)
        lines.append(f"{e:<6} | {cnt:>4}件 | {pct:>3}% | {bar}")
    return Response("\n".join(lines), media_type="text/plain; charset=utf-8")
