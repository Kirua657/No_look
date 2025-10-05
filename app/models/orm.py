# app/models/orm.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.dialects.sqlite import JSON  # or from sqlalchemy import JSON (環境に合わせて)
from app.core.db import Base  # ★ここが重要：別の declarative_base() を作らない

class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    class_id = Column(String, index=True, nullable=True)
    student_id = Column(String, index=True, nullable=True)
    emotion = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    labels = Column(JSON, nullable=False)
    topic_tags = Column(JSON, nullable=False, default=list)
    relationship_mention = Column(Boolean, nullable=False, default=False)
    negation_index = Column(Integer, nullable=False, default=0)
    avoidance = Column(Integer, nullable=False, default=0)
