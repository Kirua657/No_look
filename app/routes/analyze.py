# app/routes/analyze.py
from __future__ import annotations
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple, Any

from fastapi import APIRouter, Depends, Request, Response, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.orm import EmotionLog
from app.services.analyze_service import (
    analyze_text_to_labels,
    blend_labels_ema_with_latest_bonus,
    one_hot_from_selected,
    EMOTION_KEYS,
)
from app.services.normalizer import normalize_emotion
from app.metrics import EMOTION_TOTAL

router = APIRouter(prefix="/analyze", tags=["analyze"])

# ====== I/O Schemas ======
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
    signals: Dict[str, Any]
    features: Dict[str, Any]

# ====== Consts / Helpers ======
COOKIE_NAME = os.environ.get("NOLOOK_SID_COOKIE", "nll_sid")
SID_LEN = int(os.environ.get("NOLOOK_SID_LEN", "18"))
JST = timezone(timedelta(hours=9))

def _ensure_student_id(request: Request, response: Response) -> str:
    sid = request.cookies.get(COOKIE_NAME)
    if not sid:
        import secrets as _secrets
        sid = _secrets.token_urlsafe(SID_LEN)
        # 1年保持 / Lax / HttpOnly
        response.set_cookie(
            key=COOKIE_NAME,
            value=sid,
            max_age=60 * 60 * 24 * 365,
            httponly=True,
            samesite="lax",
        )
    return sid

def _today_range_jst(dt: datetime) -> Tuple[datetime, datetime]:
    """JSTに変換した上で、その日の 00:00:00 ～ 23:59:59.999999 (JST) を返す（tz-aware）。"""
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

def _strip_keys(d: Dict[str, float]) -> Dict[str, float]:
    """感情キーに紛れた前後空白を除去して返す。"""
    clean: Dict[str, float] = {}
    for k, v in d.items():
        nk = k.strip() if isinstance(k, str) else k
        # 念のため float 化
        try:
            clean[nk] = float(v)
        except Exception:
            continue
    return clean

# ====== Route ======
@router.post("", response_model=AnalyzeOutput)
def analyze_route(
    payload: AnalyzeInput,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    # 1) 入力取得
    raw_text = (payload.prompt if payload.prompt is not None else payload.text) or ""
    raw_text = raw_text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="prompt/text は必須です。")

    class_id = _require_or_default_class_id(payload.class_id)
    sid = _ensure_student_id(request, response)

    # 2) ラベル決定（selected 優先、無ければ自動）
    selected_vec = _selected_one_hot(payload.selected_emotion)
    inferred_vec = analyze_text_to_labels(raw_text) if selected_vec is None else selected_vec

    # ※ ラベルキーに空白が混じると集計でズレるので早めに正規化
    inferred_vec = _strip_keys(inferred_vec)
    if selected_vec is not None:
        selected_vec = _strip_keys(selected_vec)

    # 3) 同一生徒・同一JST日内の最新行を取得
    #    DBは tz-aware UTC 保存（DateTime(timezone=True)）が前提なので、
    #    検索境界も tz-aware の UTC で比較する
    now = datetime.now(timezone.utc)
    start_jst, end_jst = _today_range_jst(now)
    start_utc = start_jst.astimezone(timezone.utc)  # tz-aware UTC
    end_utc = end_jst.astimezone(timezone.utc)      # tz-aware UTC

    row = (
        db.query(EmotionLog)
        .filter(EmotionLog.class_id == class_id)
        .filter(EmotionLog.student_id == sid)
        .filter(EmotionLog.created_at >= start_utc)
        .filter(EmotionLog.created_at <= end_utc)
        .order_by(EmotionLog.created_at.desc())
        .first()
    )
    prev = row.labels if row and row.labels else {k: 0.0 for k in EMOTION_KEYS}
    prev = _strip_keys(prev)

    # 4) 保存用はEMA+最新ボーナスでブレンド、返却は selected 優先
    blended = blend_labels_ema_with_latest_bonus(prev, inferred_vec)
    blended = _strip_keys(blended)
    save_emotion = (max(blended, key=blended.get)).strip()
    save_score = float(blended[save_emotion])

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
            student_id=sid,
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

    labels_for_return = selected_vec if selected_vec is not None else blended
    labels_for_return = _strip_keys(labels_for_return)
    ret_emotion = (max(labels_for_return, key=labels_for_return.get)).strip()
    ret_score = float(labels_for_return[ret_emotion])

    # 5) メトリクス（失敗しても無視）
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
