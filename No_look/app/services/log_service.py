from __future__ import annotations
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.orm import EmotionLog

def log_emotion(
    db: Session,
    *,
    class_id: Optional[str],
    student_id: Optional[str],
    emotion: str,
    score: float,
    labels: Dict[str, float],
    signals: Optional[Dict[str, Any]] = None,
    topic_tags: Optional[list] = None,
) -> EmotionLog:
    """emotion_logs に1件INSERTして返す"""
    signals = signals or {}
    row = EmotionLog(
        class_id=class_id,
        student_id=student_id,
        emotion=emotion,
        score=float(score or 0.0),
        labels=labels,
        topic_tags=topic_tags or [],
        relationship_mention=bool(signals.get("relationship_mention", False)),
        negation_index=int(signals.get("negation_index", 0) or 0),
        avoidance=int(signals.get("avoidance", 0) or 0),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
