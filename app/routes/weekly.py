from __future__ import annotations

import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple, List, Literal

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.core.db import get_db
from app.models.orm import EmotionLog
from app.services.summary_service import generate_week_summary_view

router = APIRouter(prefix="/weekly_report", tags=["weekly"])

_CACHE: Dict[Tuple[Any, ...], Tuple[datetime, Dict[str, Any]]] = {}
_TTL_SECONDS = int(os.getenv("WEEKLY_TTL_SECONDS", "60"))

EMOTIONS: tuple[str, ...] = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")


def _safe_zoneinfo(tz: str):
    try:
        return ZoneInfo(tz)
    except ZoneInfoNotFoundError:
        try:
            return ZoneInfo("Asia/Tokyo")
        except ZoneInfoNotFoundError:
            return timezone(timedelta(hours=9), name="JST")


def _daterange(start_date: datetime, end_date: datetime) -> List[str]:
    out = []
    cur = start_date.date()
    end = end_date.date()
    while cur <= end:
        out.append(cur.isoformat())
        cur += timedelta(days=1)
    return out


def _calc_weekly(db: Session, days: int, tz: str, class_id: Optional[str]) -> Dict[str, Any]:
    Z = _safe_zoneinfo(tz or "Asia/Tokyo")
    end_local = datetime.now(Z).replace(hour=23, minute=59, second=59, microsecond=999_999)
    start_local = (end_local - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    q = db.query(EmotionLog).filter(
        and_(EmotionLog.created_at >= start_utc, EmotionLog.created_at <= end_utc)
    )
    if class_id:
        q = q.filter(EmotionLog.class_id == class_id)
    rows = q.all()

    day_buckets: Dict[str, list[EmotionLog]] = defaultdict(list)
    for r in rows:
        dt = r.created_at or datetime.now(timezone.utc)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        local_dt = dt.astimezone(Z)
        day_buckets[local_dt.date().isoformat()].append(r)

    days_keys = _daterange(start_local, end_local)
    daily_list: List[Dict[str, Any]] = []
    totals = {e: 0 for e in EMOTIONS}

    for key in days_keys:
        bucket = day_buckets.get(key, [])
        counts = {e: 0 for e in EMOTIONS}
        for r in bucket:
            e = (r.emotion or "").strip()
            if e in counts:
                counts[e] += 1
        total = sum(counts.values())
        ratios = {k: (float(counts[k]) / float(total) if total else 0.0) for k in counts.keys()}
        for e, v in counts.items():
            totals[e] += v
        daily_list.append({"date": key, "counts": counts, "ratios": ratios, "total": total})

    view = generate_week_summary_view(days, class_id, totals, daily_list)

    # ascii_rows / ascii_pretty 抽出
    ascii_rows: Optional[List[str]] = None
    v_rows = view.get("ascii_rows") if isinstance(view, dict) else None
    v_pretty = view.get("ascii_pretty") if isinstance(view, dict) else None
    if isinstance(v_rows, list):
        ascii_rows = list(map(str, v_rows))
    elif isinstance(v_rows, str):
        ascii_rows = v_rows.splitlines()
    elif isinstance(v_pretty, list):
        ascii_rows = list(map(str, v_pretty))
    elif isinstance(v_pretty, str):
        ascii_rows = v_pretty.splitlines()

    ascii_pretty = "\n".join(ascii_rows) if ascii_rows else None

    return {
        "class_id": class_id,
        "range_days": days,
        "start_date": start_local.date().isoformat(),
        "end_date": end_local.date().isoformat(),
        "daily": daily_list,
        "headline": view.get("headline"),
        "coach": view.get("coach"),
        "ascii_rows": ascii_rows,      # ⬅ 追加
        "ascii_pretty": ascii_pretty,  # 互換
        "view": view,
        "totals": totals,              # 便利なので出しておく
        "kpi": view.get("kpi"),
        "text_short": view.get("text_short"),
    }


def _cache_get(key: Tuple[Any, ...]):
    now = datetime.utcnow()
    v = _CACHE.get(key)
    if not v:
        return None
    ts, data = v
    if (now - ts).total_seconds() > _TTL_SECONDS:
        _CACHE.pop(key, None)
        return None
    return data


def _cache_set(key: Tuple[Any, ...], data: Dict[str, Any]):
    _CACHE[key] = (datetime.utcnow(), data)


@router.get("")  # レスポンス形が full/compact で変わるので response_model は外す
def weekly_report(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: Optional[str] = Query(None),
    view: Literal["full", "compact"] = Query("compact"),
    db: Session = Depends(get_db),
):
    key = ("weekly_report_v4", days, tz, class_id)
    cached = _cache_get(key)
    if cached:
        data = cached
    else:
        data = _calc_weekly(db, days=days, tz=tz, class_id=class_id)
        _cache_set(key, data)

    if view == "compact":
        # 軽量ビューだけ返す
        return {
            "headline": data.get("headline"),
            "text_short": data.get("text_short"),
            "kpi": data.get("kpi"),
            "ascii_rows": data.get("ascii_rows"),
            "coach": data.get("coach"),
            "days": data.get("range_days"),
            "tz": tz,
            "class_id": class_id,
            "start_date": data.get("start_date"),
            "end_date": data.get("end_date"),
        }
    # 既存：フル
    return data
