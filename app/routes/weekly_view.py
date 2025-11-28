from __future__ import annotations
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.db import get_db
# 週次ロジックを再利用
from app.routes.weekly import _calc_weekly, EMOTIONS, _safe_zoneinfo  # _safe_zoneinfoをweekly.pyに置いてある前提

router = APIRouter(prefix="/weekly_view", tags=["weekly"])

def _totals_from_daily(daily: List[Dict[str, Any]]) -> Dict[str, int]:
    tot = {e: 0 for e in EMOTIONS}
    for d in daily:
        for k, v in d["counts"].items():
            if k in tot:
                tot[k] += int(v)
    return tot

def _pct(n: int, d: int) -> int:
    return int(round((n / d) * 100)) if d else 0

def _bar(pct: int) -> str:
    blocks = pct // 5  # 5%で1ブロック
    return "█" * blocks

@router.get("")
def weekly_view(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    base = _calc_weekly(db, days=days, tz=tz, class_id=class_id)
    daily = base["daily"]
    totals = _totals_from_daily(daily)
    total_count = sum(totals.values())
    top_emotion = max(EMOTIONS, key=lambda e: totals.get(e, 0)) if total_count else "中立"
    top_pct = _pct(totals.get(top_emotion, 0), total_count)

    # 最多投稿日
    most = max(daily, key=lambda d: d["total"]) if daily else {"date": None, "total": 0}
    # 前半/後半トレンド
    half = max(1, len(daily)//2)
    front = _totals_from_daily(daily[:half])
    back  = _totals_from_daily(daily[half:])
    trend = []
    for e in ("楽しい","悲しい","不安"):
        if back[e] > front[e]:
            trend.append(f"{e}↑")
        elif back[e] < front[e]:
            trend.append(f"{e}↓")
    trend_text = "・".join(trend) if trend else "大きな変化なし"

    # ASCII
    lines = []
    for e in EMOTIONS:
        cnt = totals[e]
        pct = _pct(cnt, total_count)
        lines.append(f"{e:<6} | {cnt:>4}件 | {pct:>3}% | {_bar(pct)}")
    ascii_pretty = "\n".join(lines)

    # compact
    daily_compact = [{"date": d["date"], "total": d["total"],
                      "top": (max(d["counts"], key=d["counts"].get) if d["total"] else "中立")}
                     for d in daily]

    # コーチング（超簡易ルール）
    risk_level = "low"
    risk_color = "#4CAF50"
    risk_label = "安定（緑）"
    if totals["不安"] + totals["悲しい"] >= totals["楽しい"]:
        risk_level, risk_color, risk_label = "mid", "#FFC107", "注意（黄）"
    if totals["不安"] >= totals["楽しい"] and totals["悲しい"] >= totals["楽しい"]:
        risk_level, risk_color, risk_label = "high", "#F44336", "警戒（赤）"

    return {
        "headline": f"{class_id or '-'} / {days}日: 投稿{total_count}件・最多「{top_emotion}」{top_pct}%",
        "text_short": f"{class_id or '-'}: {top_emotion}が最多 ({top_pct}%) / 合計{total_count}件",
        "kpi": {"total": total_count, "top": top_emotion, "top_pct": top_pct},
        "highlights": [
            f"投稿最多: {most['date']}（{most['total']}件）" if most["date"] else "投稿なし",
            f"前半→後半: {trend_text}",
        ],
        "ascii_pretty": ascii_pretty,
        "daily_compact": daily_compact,
        "coach": {
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_label": risk_label,
            "suggestions": [
                "後半に不安が増加。小テスト/行事前後の説明と見通し提示を。"
            ],
        },
        "days": days,
        "tz": tz,
        "class_id": class_id,
        "start_local": f"{base['start_date']}T00:00:00+09:00",
        "end_local":   f"{base['end_date']}T23:59:59+09:00",
        "daily": daily,
        "totals": totals,
        "top_emotion": top_emotion,
        "text": f"直近{days}日、投稿{total_count}件。最多は「{top_emotion}」（{top_pct}%）。",
    }
