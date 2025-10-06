# app/models/orm.py
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.dialects.sqlite import JSON
from app.core.db import Base

class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id = Column(Integer, primary_key=True, index=True)

    # 保存時にUTC時刻を明示的に使用
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    class_id = Column(String, index=True, nullable=True)
    student_id = Column(String, index=True, nullable=True)
    emotion = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    labels = Column(JSON, nullable=False)
    topic_tags = Column(JSON, nullable=False, default=list)
    relationship_mention = Column(Boolean, nullable=False, default=False)
    negation_index = Column(Integer, nullable=False, default=0)
    avoidance = Column(Integer, nullable=False, default=0)
