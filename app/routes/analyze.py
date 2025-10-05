# app/routes/analyze.py
from __future__ import annotations
import os, secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from fastapi import APIRouter, Depends, Request, Response, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db, init_db
from app.models.orm import EmotionLog
from app.services.analyze_service import (
    analyze_text_to_labels,
    blend_labels_ema_with_latest_bonus,
    one_hot_from_selected,
    EMOTION_KEYS,
)
from app.services.normalizer import normalize_emotion
from app.metrics import EMOTION_TOTAL

router = APIRouter()

class AnalyzeInput(BaseModel):
    prompt: Optional[str] = None
    text: Optional[str] = None
    class_id: Optional[str] = None
    selected_emotion: Optional[str] = None

class AnalyzeOutput(BaseModel):
    id: int
    class_id: Optional[str]
    created_at: str
    labels: Dict[str, float]
    emotion: str
    score: float
    student_id: str
    signals: Dict[str, object]
    features: Dict[str, object]

COOKIE_NAME = os.environ.get("NOLOOK_SID_COOKIE", "nll_sid")
SID_LEN = int(os.environ.get("NOLOOK_SID_LEN", "18"))
JST = timezone(timedelta(hours=9))

def _ensure_student_id(request: Request, response: Response) -> str:
    sid = request.cookies.get(COOKIE_NAME)
    if not sid:
        import secrets as _secrets
        sid = _secrets.token_urlsafe(SID_LEN)
        response.set_cookie(key=COOKIE_NAME, value=sid, max_age=60 * 60 * 24 * 365, httponly=True, samesite="lax")
    return sid

def _today_range_jst(dt: datetime) -> Tuple[datetime, datetime]:
    local = dt.astimezone(JST)
    start = datetime(local.year, local.month, local.day, tzinfo=JST)
    end = start + timedelta(days=1) - timedelta(microseconds=1)
    return start, end

def _require_or_default_class_id(v: Optional[str]) -> str:
    strict = os.getenv("NOLOOK_CLASS_ID_STRICT", "0") == "1"
    default_cid = os.getenv("NOLOOK_CLASS_ID_DEFAULT", "default")
    if strict:
        if not v or not v.strip():
            raise HTTPException(status_code=422, detail="class_id は必須です。")
        return v.strip()
    return (v.strip() if v and v.strip() else default_cid)

def _selected_one_hot(sel: Optional[str]) -> Optional[Dict[str, float]]:
    if sel is None:
        return None
    norm = normalize_emotion(sel)
    if norm is None:
        raise HTTPException(status_code=422, detail="selected_emotion を正規化できません。")
    return one_hot_from_selected(norm)

@router.post("/analyze", response_model=AnalyzeOutput)
def analyze_route(payload: AnalyzeInput, request: Request, response: Response, db: Session = Depends(get_db)):
    init_db()

    # 1) 入力
    raw_text = (payload.prompt if payload.prompt is not None else payload.text) or ""
    raw_text = raw_text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="prompt/text は必須です。")

    class_id = _require_or_default_class_id(payload.class_id)
    sid = _ensure_student_id(request, response)

    # 2) ラベル（selected 優先）
    selected_vec = _selected_one_hot(payload.selected_emotion)
    inferred_vec = analyze_text_to_labels(raw_text) if selected_vec is None else selected_vec

    # 3) 直近同日の最新行を参照（UTC naiveで比較）
    now = datetime.now(tz=JST)
    start_jst, end_jst = _today_range_jst(now)
    start_utc = start_jst.astimezone(timezone.utc).replace(tzinfo=None)
    end_utc = end_jst.astimezone(timezone.utc).replace(tzinfo=None)

    row = (
        db.query(EmotionLog)
        .filter(EmotionLog.class_id == class_id)
        .filter(EmotionLog.student_id == sid)  # ★ 同じ生徒のみ対象
        .filter(EmotionLog.created_at >= start_utc)
        .filter(EmotionLog.created_at <= end_utc)
        .order_by(EmotionLog.created_at.desc())
        .first()
    )
    prev = row.labels if row and row.labels else {k: 0.0 for k in EMOTION_KEYS}

    # 4) 保存用はブレンド、返却は selected があれば one-hot
    blended = blend_labels_ema_with_latest_bonus(prev, inferred_vec)
    save_emotion = max(blended, key=blended.get)
    save_score = float(blended[save_emotion])

    # 既存があれば更新、なければINSERT（新規時は student_id を保存）
    if row:
        row.emotion = save_emotion
        row.score = save_score
        row.labels = blended
        db.add(row)
        db.commit()
        db.refresh(row)
        rec_id = row.id
        created = row.created_at
    else:
        new_row = EmotionLog(
            class_id=class_id,
            student_id=sid,  # ★ 必ず保存
            emotion=save_emotion,
            score=save_score,
            labels=blended,
            topic_tags=[],
            relationship_mention=False,
            negation_index=0,
            avoidance=0,
        )
        db.add(new_row)
        db.commit()
        db.refresh(new_row)
        rec_id = new_row.id
        created = new_row.created_at

    # 返却ラベルは selected 優先（完全 one-hot）
    labels_for_return = selected_vec if selected_vec is not None else blended
    ret_emotion = max(labels_for_return, key=labels_for_return.get)
    ret_score = float(labels_for_return[ret_emotion])

    try:
        EMOTION_TOTAL.labels(emotion=save_emotion).inc()
    except Exception:
        pass

    created_str = created.isoformat() if hasattr(created, "isoformat") else str(created)
    signals = {"relationship_mention": False, "negation_index": 0, "avoidance": 0, "topic_tags": []}

    return AnalyzeOutput(
        id=rec_id,
        class_id=class_id,
        created_at=created_str,
        labels=labels_for_return,
        emotion=ret_emotion,
        score=ret_score,
        student_id=sid,
        signals=signals,
        features=dict(signals),
    )

