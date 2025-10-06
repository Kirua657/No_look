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


def _to_ascii_pretty(view: dict) -> Optional[str]:
    """
    互換ヘルパー:
    - view["ascii_pretty"]（文字列 or 配列）→ 文字列
    - view["ascii_rows"]  （文字列 or 配列）→ 文字列
    いずれも無ければ None
    """
    if not isinstance(view, dict):
        return None

    v = view.get("ascii_pretty")
    if v is not None:
        if isinstance(v, str):
            return v
        if isinstance(v, list):
            return "\n".join(map(str, v))

    rows = view.get("ascii_rows")
    if rows is None:
        return None
    if isinstance(rows, str):
        return rows
    if isinstance(rows, list):
        return "\n".join(map(str, rows))

    return None


@router.get("", summary="日別サマリー（直近N日）")
def summary(
    days: int = Query(7, ge=1, le=31),
    class_id: Optional[str] = Query(None),
    tz: str = Query("Asia/Tokyo"),
    view: Literal["full", "compact"] = Query(
        "full", description="full=従来全部 / compact=人間向け要点のみ"
    ),
):
    """直近 N 日の感情カウント（日別）＋人間向けビュー（full/compact）を返す。"""
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    # タイムゾーン解決
    try:
        tzinfo = zoneinfo.ZoneInfo(tz)
    except Exception:
        tzinfo = timezone(timedelta(hours=9))
        tz = "Asia/Tokyo"

    # ローカル起点レンジ（今日含む days 日）
    today_local = datetime.now(tzinfo).date()
    start_date_local = today_local - timedelta(days=days - 1)
    start_local_aware = datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo)
    start_utc_naive = start_local_aware.astimezone(timezone.utc).replace(tzinfo=None)

    where = [EmotionLog.created_at >= start_utc_naive]
    if class_id:
        where.append(EmotionLog.class_id == class_id)

    # 取得
    with session_scope() as s:
        rows = s.execute(
            select(EmotionLog.created_at, EmotionLog.emotion).where(and_(*where))
        ).all()

    # ローカル日変換
    def to_local_date_str(dtobj: datetime) -> str:
        # DBはnaive UTC保存想定
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

    # 合計
    totals = {k: 0 for k in EMOTION_KEYS}
    for counts in by_day.values():
        for k, v in counts.items():
            totals[k] += v

    # daily（配列化）
    daily_list: List[Dict[str, object]] = []
    for i in range(days):
        d = (start_date_local + timedelta(days=i)).isoformat()
        daily_list.append({"date": d, "counts": by_day[d]})

    # 人間向けビュー生成
    view_data = generate_week_summary_view(days, class_id, totals, daily_list)

    # ascii表は型ゆらぎに対応（dict/str/listのどれでも受ける）
    ascii_pretty = _to_ascii_pretty(view_data) or ""

    if view == "compact":
        # ひと目で分かる要点だけ返す（Swagger/UIの一覧向け）
        return {
            "headline": view_data.get("headline", ""),
            "text_short": view_data.get("text_short", ""),
            "kpi": view_data.get("kpi", {}),
            "highlights": view_data.get("highlights", []),
            "ascii_pretty": ascii_pretty,
            "coach": view_data.get("coach", ""),
            # 軽く文脈情報（クエリの再現）
            "days": days,
            "tz": tz,
            "class_id": class_id,
            "start_local": datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo).isoformat(),
            "end_local": datetime.combine(today_local, dtime(23, 59, 59), tzinfo=tzinfo).isoformat(),
        }

    # full（従来＋見やすさ層すべて）
    return {
        # 見やすい層（先頭に出す）
        "headline": view_data.get("headline", ""),
        "text_short": view_data.get("text_short", ""),
        "kpi": view_data.get("kpi", {}),
        "highlights": view_data.get("highlights", []),
        "ascii_pretty": ascii_pretty,
        "daily_compact": view_data.get("daily_compact", []),
        "coach": view_data.get("coach", ""),
        # 生データ互換
        "days": days,
        "tz": tz,
        "class_id": class_id,
        "start_local": datetime.combine(start_date_local, dtime(0, 0), tzinfo=tzinfo).isoformat(),
        "end_local": datetime.combine(today_local, dtime(23, 59, 59), tzinfo=tzinfo).isoformat(),
        "daily": daily_list,
        "totals": totals,
        "top_emotion": view_data.get("kpi", {}).get("top"),
        "text": (
            f"直近{days}日、投稿{view_data.get('kpi', {}).get('total', 0)}件。"
            f"最多は「{view_data.get('kpi', {}).get('top', '不明')}」（{view_data.get('kpi', {}).get('top_pct', 0)}%）。"
        ),
    }
