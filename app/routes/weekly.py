from __future__ import annotations

import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple, List

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import and_
from zoneinfo import ZoneInfo

from app.core.db import get_db
from app.models.orm import EmotionLog
from app.schemas.dashboard import DashboardResponse  # ★ 追加

router = APIRouter(prefix="/weekly_report", tags=["weekly"])

# シンプルTTLキャッシュ（プロセス内）
_CACHE: Dict[Tuple[Any, ...], Tuple[datetime, Dict[str, Any]]] = {}
_TTL_SECONDS = int(os.getenv("WEEKLY_TTL_SECONDS", "60"))

EMOTIONS: tuple[str, ...] = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

def _daterange(start_date: datetime, end_date: datetime) -> List[str]:
    """start_date..end_date（どちらもローカルTZ・日付境界済み）を YYYY-MM-DD 文字列のリストで返す。"""
    out = []
    cur = start_date.date()
    end = end_date.date()
    while cur <= end:
        out.append(cur.isoformat())
        cur += timedelta(days=1)
    return out

def _calc_weekly(
    db: Session,
    days: int,
    tz: str,
    class_id: Optional[str],
) -> Dict[str, Any]:
    # ---- TZ解決（不正なら JST）----
    try:
        Z = ZoneInfo(tz)
    except Exception:
        Z = ZoneInfo("Asia/Tokyo")

    # ---- 期間（ローカル基準 days 日）----
    end_local = datetime.now(Z).replace(hour=23, minute=59, second=59, microsecond=999_999)
    start_local = (end_local - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)

    # ---- 検索は tz-aware UTC で ----
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    q = (
        db.query(EmotionLog)
        .filter(
            and_(
                EmotionLog.created_at >= start_utc,
                EmotionLog.created_at <= end_utc,
            )
        )
    )
    if class_id:
        q = q.filter(EmotionLog.class_id == class_id)

    rows = q.all()

    # ---- ローカル日に変換して日別にバケツ ----
    day_buckets: Dict[str, list[EmotionLog]] = defaultdict(list)
    for r in rows:
        local_dt = r.created_at.astimezone(Z)  # tz-aware UTC -> ローカルTZ
        key = local_dt.date().isoformat()
        day_buckets[key].append(r)

    # ---- 欠け日も0で埋める / counts と ratios を計算 ----
    days_keys = _daterange(start_local, end_local)
    daily_list = []
    for key in days_keys:
        bucket = day_buckets.get(key, [])
        counts: Dict[str, int] = {e: 0 for e in EMOTIONS}
        for r in bucket:
            e = (r.emotion or "").strip()
            if e in counts:
                counts[e] += 1
            else:
                counts.setdefault(e, 0)
                counts[e] += 1
        total = sum(counts.values())
        ratios = {k: (float(counts[k]) / float(total) if total else 0.0) for k in counts.keys()}  # ★ 小数統一
        daily_list.append({"date": key, "counts": counts, "ratios": ratios, "total": total})

    return {
        "class_id": class_id,
        "range_days": days,
        "start_date": start_local.date().isoformat(),
        "end_date": end_local.date().isoformat(),
        "daily": daily_list,  # teacher_dashboard と同じ構造
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

@router.get("", response_model=DashboardResponse)  # ★ response_model 追加
def weekly_report(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # TTLキャッシュキー
    key = ("weekly_v2_same_schema", days, tz, class_id)
    cached = _cache_get(key)
    if cached:
        return cached
    data = _calc_weekly(db, days=days, tz=tz, class_id=class_id)
    _cache_set(key, data)
    return data
