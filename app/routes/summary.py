# app/routes/summary.py
from datetime import datetime, timedelta, timezone, time as dtime
import zoneinfo
from typing import Dict, Optional, List
from fastapi import APIRouter, Query
from sqlalchemy import select, and_
from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog

# main.py 側でそのまま include できるように prefix 付き
router = APIRouter(prefix="/summary", tags=["summary"])
_initialized = False

EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

@router.get("", summary="日別サマリー（直近N日）")
def summary(
    days: int = Query(7, ge=1, le=31),
    class_id: Optional[str] = Query(None),
    tz: str = Query("Asia/Tokyo"),
):
    """直近 N 日の感情カウント（日別）と期間合計のみを返す軽量API。"""
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    # timezone 解決
    try:
        tzinfo = zoneinfo.ZoneInfo(tz)
    except Exception:
        tzinfo = timezone(timedelta(hours=9))

    # ローカル起点レンジ（今日含む days 日）
    today_local = datetime.now(tzinfo).date()
    start_date_local = today_local - timedelta(days=days-1)
    start_local_aware = datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo)
    start_utc_naive = start_local_aware.astimezone(timezone.utc).replace(tzinfo=None)

    where = [EmotionLog.created_at >= start_utc_naive]
    if class_id:
        where.append(EmotionLog.class_id == class_id)

    with session_scope() as s:
        rows = s.execute(
            select(EmotionLog.created_at, EmotionLog.emotion).where(and_(*where))
        ).all()

    def to_local_date_str(dtobj: datetime) -> str:
        # DBはnaive UTCで保存している前提
        if dtobj.tzinfo is None:
            dtobj = dtobj.replace(tzinfo=timezone.utc)
        return dtobj.astimezone(tzinfo).date().isoformat()

    # 日別バケツ（dict 作ってから配列化）
    by_day: Dict[str, Dict[str, int]] = {
        (start_date_local + timedelta(days=i)).isoformat(): {k: 0 for k in EMOTION_KEYS}
        for i in range(days)
    }
    for created_at, emo in rows:
        d = to_local_date_str(created_at)
        if d in by_day and emo in by_day[d]:
            by_day[d][emo] += 1

    # 期間合計・トップ感情
    totals = {k: 0 for k in EMOTION_KEYS}
    for counts in by_day.values():
        for k, v in counts.items():
            totals[k] += v
    top = "中立" if sum(totals.values()) == 0 else max(
        EMOTION_KEYS, key=lambda k: (totals[k], -EMOTION_KEYS.index(k))
    )

    # ★ テスト互換：daily は配列、各要素に "counts" を持たせる
    daily_list: List[Dict[str, object]] = []
    for i in range(days):
        d = (start_date_local + timedelta(days=i)).isoformat()
        daily_list.append({"date": d, "counts": by_day[d]})

    return {
        "days": days,
        "tz": tz,
        "class_id": class_id,
        "start_local": datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo).isoformat(),
        "end_local": datetime.combine(today_local, dtime(23, 59, 59), tzinfo=tzinfo).isoformat(),
        "daily": daily_list,
        "totals": totals,
        "top_emotion": top,
    }
