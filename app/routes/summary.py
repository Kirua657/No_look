# app/routes/summary.py
from __future__ import annotations

from datetime import datetime, timedelta, timezone, time as dtime
import zoneinfo
from typing import Dict, Optional, List, Literal

from fastapi import APIRouter, Query
from sqlalchemy import select, and_

from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog
from app.services.summary_service import generate_week_summary_view

router = APIRouter(prefix="/summary", tags=["summary"])
_initialized = False

EMOTION_KEYS = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]


def _get_ascii_rows(view: dict) -> Optional[List[str]]:
    """ascii_rows or ascii_pretty をリスト形式で統一"""
    if not isinstance(view, dict):
        return None
    rows = view.get("ascii_rows")
    if isinstance(rows, list):
        return list(map(str, rows))
    if isinstance(rows, str):
        return rows.splitlines()

    pretty = view.get("ascii_pretty")
    if isinstance(pretty, list):
        return list(map(str, pretty))
    if isinstance(pretty, str):
        return pretty.splitlines()

    return None


@router.get("", summary="日別サマリー（直近N日）")
def summary(
    days: int = Query(7, ge=1, le=31),
    class_id: Optional[str] = Query(None),
    tz: str = Query("Asia/Tokyo"),
    view: Literal["full", "compact"] = Query(
        "compact", description="full=従来全部 / compact=人間向け要点のみ"
    ),
):
    """直近 N 日の感情カウント（日別）＋人間向けビュー（full/compact）を返す。"""
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    # タイムゾーン
    try:
        tzinfo = zoneinfo.ZoneInfo(tz)
    except Exception:
        tzinfo = timezone(timedelta(hours=9))
        tz = "Asia/Tokyo"

    today_local = datetime.now(tzinfo).date()
    start_date_local = today_local - timedelta(days=days - 1)
    start_local_aware = datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo)
    start_utc_naive = start_local_aware.astimezone(timezone.utc).replace(tzinfo=None)

    where = [EmotionLog.created_at >= start_utc_naive]
    if class_id:
        where.append(EmotionLog.class_id == class_id)

    # データ取得
    with session_scope() as s:
        rows = s.execute(
            select(EmotionLog.created_at, EmotionLog.emotion).where(and_(*where))
        ).all()

    def to_local_date_str(dtobj: datetime) -> str:
        if dtobj.tzinfo is None:
            dtobj = dtobj.replace(tzinfo=timezone.utc)
        return dtobj.astimezone(tzinfo).date().isoformat()

    # 日別カウント
    by_day: Dict[str, Dict[str, int]] = {
        (start_date_local + timedelta(days=i)).isoformat(): {k: 0 for k in EMOTION_KEYS}
        for i in range(days)
    }
    for created_at, emo in rows:
        d = to_local_date_str(created_at)
        if d in by_day and emo in by_day[d]:
            by_day[d][emo] += 1

    totals = {k: 0 for k in EMOTION_KEYS}
    for counts in by_day.values():
        for k, v in counts.items():
            totals[k] += v

    daily_list: List[Dict[str, object]] = []
    for i in range(days):
        d = (start_date_local + timedelta(days=i)).isoformat()
        daily_list.append({"date": d, "counts": by_day[d]})

    # ビュー生成
    view_data = generate_week_summary_view(days, class_id, totals, daily_list)
    ascii_rows = _get_ascii_rows(view_data)

    base = {
        "headline": view_data["headline"],
        "text_short": view_data["text_short"],
        "kpi": view_data["kpi"],
        "highlights": view_data["highlights"],
        "ascii_rows": ascii_rows,
        "coach": view_data["coach"],
        "days": days,
        "tz": tz,
        "class_id": class_id,
        "start_local": datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo).isoformat(),
        "end_local": datetime.combine(today_local, dtime(23, 59, 59), tzinfo=tzinfo).isoformat(),
    }

    if view == "compact":
        return base

    # fullモードは extraデータだけ追加
    base.update(
        {
            "daily_compact": view_data.get("daily_compact"),
            "daily": daily_list,
            "totals": totals,
            "top_emotion": view_data["kpi"]["top"],
            "text": (
                f"直近{days}日、投稿{view_data['kpi']['total']}件。"
                f"最多は「{view_data['kpi']['top']}」（{view_data['kpi']['top_pct']}%）。"
            ),
        }
    )
    return base
