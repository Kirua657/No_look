from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from app.core.db import get_db
from app.models.orm import EmotionLog
from app.schemas.dashboard import DashboardResponse  # ★ 追加

router = APIRouter(prefix="/teacher_dashboard", tags=["teacher"])

@router.get("", response_model=DashboardResponse)  # ★ response_model 追加
def teacher_dashboard(
    class_id: str = Query(..., description="クラスID（例: 1-A）"),
    days: int = Query(7, ge=1, le=60, description="過去n日分（1〜60）"),
    tz: str = Query("Asia/Tokyo", description="タイムゾーン（IANA名）"),
    db: Session = Depends(get_db),
):
    """
    UTC保存の EmotionLog をローカルタイムゾーン単位（日）で集計して返す。
    - DB検索はUTC between
    - 日毎のバケツはローカルTZに変換して date() キー化
    返却:
      {
        class_id, range_days, start_date, end_date,
        daily: [{date, counts{6感情}, ratios{6感情}, total}]
      }
    """
    # ---- TZ 解決（不正指定は JST にフォールバック） ----
    try:
        Z = ZoneInfo(tz)
    except Exception:
        Z = ZoneInfo("Asia/Tokyo")

    # ---- 期間（ローカル基準で days 日間）----
    end_local = datetime.now(Z).replace(hour=23, minute=59, second=59, microsecond=999_999)
    start_local = (end_local - timedelta(days=days - 1)).replace(hour=0, minute=0, second=0, microsecond=0)

    # ---- 検索はUTCで ----
    start_utc = start_local.astimezone(timezone.utc)
    end_utc = end_local.astimezone(timezone.utc)

    # ---- 取得（class_id + 期間）----
    rows = (
        db.query(EmotionLog)
        .filter(
            and_(
                EmotionLog.class_id == class_id,
                EmotionLog.created_at >= start_utc,
                EmotionLog.created_at <= end_utc,
            )
        )
        .all()
    )

    # ---- 日毎バケツ（ローカル日に変換してキー化）----
    day_buckets: Dict[str, list[EmotionLog]] = defaultdict(list)
    for r in rows:
        local_dt = r.created_at.astimezone(Z)  # tz-aware UTC -> ローカルTZへ
        key = local_dt.date().isoformat()      # "YYYY-MM-DD"
        day_buckets[key].append(r)

    # ---- 欠け日も0で埋める・counts/ratiosを計算 ----
    EMOTIONS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

    daily = []
    cur = start_local.date()
    while cur <= end_local.date():
        key = cur.isoformat()
        bucket = day_buckets.get(key, [])
        counts: Dict[str, int] = {e: 0 for e in EMOTIONS}
        for r in bucket:
            e = (r.emotion or "").strip()
            if e in counts:
                counts[e] += 1
            else:
                # 万一未知ラベルが来ても落ちないよう保険
                counts.setdefault(e, 0)
                counts[e] += 1
        total = sum(counts.values())
        ratios = {k: (float(counts[k]) / float(total) if total else 0.0) for k in counts.keys()}  # ★ 小数統一
        daily.append({"date": key, "counts": counts, "ratios": ratios, "total": total})
        cur += timedelta(days=1)

    return {
        "class_id": class_id,
        "range_days": days,
        "start_date": start_local.date().isoformat(),
        "end_date": end_local.date().isoformat(),
        "daily": daily,
    }
