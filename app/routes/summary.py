from datetime import datetime, timedelta, timezone, time as dtime
import zoneinfo
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_
from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog

router = APIRouter()
_initialized = False
EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

@router.get("", summary="日別サマリー")
def summary(
    days: int = 7,
    class_id: Optional[str] = None,
    tz: str = "Asia/Tokyo",
):
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    try:
        tzinfo = zoneinfo.ZoneInfo(tz)
    except Exception:
        tzinfo = timezone(timedelta(hours=9))

    # 今日(ローカル)の 00:00 を UTC に変換して下限にする
    today_local = datetime.now(tzinfo).date()
    start_date_local = today_local - timedelta(days=days-1)
    start_local_aware = datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo)
    start_utc_naive = start_local_aware.astimezone(timezone.utc).replace(tzinfo=None)

    where = [EmotionLog.created_at >= start_utc_naive]
    if class_id:
        where.append(EmotionLog.class_id == class_id)

    rows = []
    with session_scope() as s:
        rows = s.execute(
            select(EmotionLog.created_at, EmotionLog.emotion).where(and_(*where))
        ).all()

    def to_local_date_str(dtobj: datetime) -> str:
        # DBはnaive UTCで保存している前提
        if dtobj.tzinfo is None:
            dtobj = dtobj.replace(tzinfo=timezone.utc)
        return dtobj.astimezone(tzinfo).date().isoformat()

    # 日付バケツ
    by_day: Dict[str, Dict[str, int]] = {
        (start_date_local + timedelta(days=i)).isoformat(): {k: 0 for k in EMOTION_KEYS}
        for i in range(days)
    }

    for created_at, emo in rows:
        d = to_local_date_str(created_at)
        if d in by_day and emo in by_day[d]:
            by_day[d][emo] += 1

    daily = []
    totals = {k: 0 for k in EMOTION_KEYS}
    for i in range(days):
        d = (start_date_local + timedelta(days=i)).isoformat()
        counts = by_day[d]
        total = sum(counts.values())
        daily.append({"date": d, "counts": counts, "total": total})
        for k,v in counts.items():
            totals[k] += v

    top = "中立" if sum(totals.values()) == 0 else max(EMOTION_KEYS, key=lambda k: (totals[k], -EMOTION_KEYS.index(k)))
    return {"days": days, "daily": daily, "totals": totals, "top_emotion": top}
