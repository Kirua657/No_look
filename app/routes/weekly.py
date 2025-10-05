# app/routes/weekly.py
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from ..models.orm import EmotionLog  # ←あなたのモデル名に合わせて

router = APIRouter(prefix="/weekly_report", tags=["weekly"])

# シンプルなTTLキャッシュ（プロセス内）
_CACHE: Dict[Tuple[Any, ...], Tuple[datetime, Dict[str, Any]]] = {}
_TTL_SECONDS = int(os.getenv("WEEKLY_TTL_SECONDS", "60"))  # ← env化: WEEKLY_TTL_SECONDS=60

EMOTIONS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

def _tz(tz_name: str):
    # 依存を増やさない簡易版：固定で日本時間を優先
    if tz_name in ("Asia/Tokyo", "JST"):
        return timezone(timedelta(hours=9))
    return timezone.utc

def _daterange(start: datetime, end: datetime, step_days=1):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=step_days)

def _calc_weekly(db: Session, days: int, tz: str, class_id: Optional[str], last_n_days: int):
    tzinfo = _tz(tz)
    utc_now = datetime.utcnow().replace(tzinfo=timezone.utc)
    local_today = utc_now.astimezone(tzinfo).date()
    local_start = datetime.combine(local_today - timedelta(days=days - 1), datetime.min.time(), tzinfo)
    local_end = datetime.combine(local_today, datetime.max.time(), tzinfo)

    # UTCのnaive保存を想定 → DBはnaive UTC, 取り出し時にローカルへ
    start_utc = (local_start.astimezone(timezone.utc)).replace(tzinfo=None)
    end_utc = (local_end.astimezone(timezone.utc)).replace(tzinfo=None)

    q = db.query(EmotionLog).filter(EmotionLog.created_at >= start_utc, EmotionLog.created_at <= end_utc)
    if class_id:
        q = q.filter(EmotionLog.class_id == class_id)

    rows = q.all()

    # 日別カウント
    by_day: Dict[str, Dict[str, int]] = {}
    for d in _daterange(local_start, local_end):
        key = d.date().isoformat()
        by_day[key] = {e: 0 for e in EMOTIONS}

    for r in rows:
        # naive UTC → tzへ
        dt_utc = r.created_at.replace(tzinfo=timezone.utc)
        dt_local = dt_utc.astimezone(tzinfo)
        day_key = dt_local.date().isoformat()
        emo = r.emotion if r.emotion in EMOTIONS else "中立"
        by_day.setdefault(day_key, {e: 0 for e in EMOTIONS})
        by_day[day_key][emo] += 1

    # 上昇/下降（直近 last_n_days vs それ以前）
    days_list = sorted(by_day.keys())
    if not days_list:
        earlier = {e: 0 for e in EMOTIONS}
        recent = {e: 0 for e in EMOTIONS}
    else:
        head = days_list[:-last_n_days] or []  # earlier
        tail = days_list[-last_n_days:]        # recent（少なくとも1日）
        def sums(keys):
            s = {e: 0 for e in EMOTIONS}
            for k in keys:
                for e in EMOTIONS:
                    s[e] += by_day[k][e]
            return s
        earlier = sums(head)
        recent = sums(tail)

    trend = []
    for e in EMOTIONS:
        delta = recent[e] - earlier[e]
        trend.append({"emotion": e, "delta": delta, "recent": recent[e], "earlier": earlier[e]})

    rising = sorted([t for t in trend if t["delta"] > 0], key=lambda x: x["delta"], reverse=True)[:2]
    falling = sorted([t for t in trend if t["delta"] < 0], key=lambda x: x["delta"])[:2]

        # ---- 人間味ある要約 & 提案（軽量ルール）----
    def _humanize(by_day: Dict[str, Dict[str, int]], rising, last_n_days: int):
        days_list = sorted(by_day.keys())
        tail = days_list[-last_n_days:] if days_list else []
        recent_sum = {e: 0 for e in EMOTIONS}
        for k in tail:
            for e, v in by_day[k].items():
                recent_sum[e] += v
        total_recent = sum(recent_sum.values())
        top = max(recent_sum.items(), key=lambda kv: kv[1])[0] if total_recent else "中立"

        lead = ""
        if rising:
            r0 = rising[0]
            lead = f"直近は「{r0['emotion']}」が増加（+{r0['delta']}件）。"
        if top and (not rising or top != rising[0]["emotion"]):
            lead = (lead + " " if lead else "") + f"いま多いのは「{top}」。"
        if not lead:
            lead = "直近の分布に大きな偏りはありません。"

        suggestions: list[str] = []
        if top == "中立":
            suggestions.append("HRで『いま一番気がかりなこと』を1つだけ共有する時間を3分つくる。")
        if any(x["emotion"] == "不安" for x in rising):
            suggestions.append("期限の近いタスクを3つに分け、“今日やる1つ”を決める。")
        if any(x["emotion"] == "怒り" for x in rising):
            suggestions.append("“もやっと”を匿名1行アンケートで回収し、事実/解釈/感情で整理。")
        if any(x["emotion"] == "楽しい" for x in rising):
            suggestions.append("良かった出来事を1人1つ称えるタイムを入れて定着を促す。")
        if top in ("悲しい", "しんどい"):
            suggestions.append("原因メモを短文で残し、休息・相談の導線を明確に。")

        text = lead + " 日別の変化理由はログを2〜3件ピックして確認しましょう。"
        return text, suggestions

    summary, suggestions = _humanize(by_day, rising, last_n_days)

    return {
        "range": {
            "days": days, "tz": tz,
            "start_local": local_start.isoformat(),
            "end_local": local_end.isoformat(),
            "class_id": class_id,
            "last_n_days": last_n_days,
            "cache_ttl_seconds": _TTL_SECONDS,
        },
        "daily": by_day,
        "rising": rising,
        "falling": falling,
        "summary": summary,
        "suggestions": suggestions,
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

@router.get("")
def weekly_report(
    days: int = Query(7, ge=3, le=31),
    tz: str = Query("Asia/Tokyo"),
    class_id: Optional[str] = Query(None),
    last_n_days: int = Query(3, ge=1, le=14),   # ← 直近/以前の境界をパラメタ化
    db: Session = Depends(get_db),
):
    # TTLキャッシュキーに last_n_days も含める
    key = ("weekly", days, tz, class_id, last_n_days)
    cached = _cache_get(key)
    if cached:
        return cached
    data = _calc_weekly(db, days=days, tz=tz, class_id=class_id, last_n_days=last_n_days)
    _cache_set(key, data)
    return data

