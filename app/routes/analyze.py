# app/routes/analyze.py
from fastapi import APIRouter, Body, HTTPException
from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog
from app.services.emotion import classify_by_rules
from datetime import datetime, UTC

router = APIRouter()
_initialized = False

EMOTION_KEYS = ["楽しい","悲しい","怒り","不安","しんどい","中立"]

@router.post("", summary="テキストを6分類で解析（text / prompt 両対応）")
def analyze(payload: dict = Body(...)):
    """
    後方互換: JSON の "text" でも "prompt" でもOK。dict受けで422を回避。
    常に emotion / score / labels / signals を返す。
    """
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    raw = (payload.get("text") or payload.get("prompt") or "")
    text = str(raw).strip()
    if not text:
        raise HTTPException(status_code=400, detail="text/prompt が空です。")

    topic_hint = payload.get("topic_hint") or []
    class_id = payload.get("class_id")

    rr = classify_by_rules(text, topic_hint)
    selected = payload.get("selected_emotion")
    final_emotion = (selected or rr.emotion)
    score = float(rr.labels.get(final_emotion, 1.0))

    # 保存（生テキストは保存しない）: ★ with ブロック内に s.add(row) まで入れる
    with session_scope() as s:
        row = EmotionLog(
            class_id=class_id,
            emotion=final_emotion,
            score=score,
            relationship_mention=False,
            negation_index=0.0,
            avoidance=0.0,
            labels={k: float(rr.labels.get(k, 0.0)) for k in EMOTION_KEYS},
            topic_tags=list(rr.topic_tags or []),
            created_at=datetime.now(UTC).replace(tzinfo=None),
        )
        s.add(row)

    # 応答
    return {
        "emotion": final_emotion,
        "score": score,
        "labels": {k: float(rr.labels.get(k, 0.0)) for k in EMOTION_KEYS},
        "signals": {
            "relationship_mention": False,
            "negation_index": 0.0,
            "avoidance": 0.0,
            "topic_tags": rr.topic_tags or [],
        },
    }
