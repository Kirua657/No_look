from __future__ import annotations
from sqlalchemy import Integer, String, Float, Boolean, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base

# SQLite でも SQLAlchemy の JSON 型は TEXT にフォールバックして動きます
class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    class_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    emotion: Mapped[str] = mapped_column(String(8), nullable=False)  # 楽しい/悲しい/怒り/不安/しんどい/中立
    score: Mapped[float] = mapped_column(Float, nullable=False)

    relationship_mention: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    negation_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avoidance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    labels: Mapped[dict] = mapped_column(JSON, nullable=False)       # {"楽しい":0.0,...}
    topic_tags: Mapped[list] = mapped_column(JSON, nullable=False)    # ["部活",...]

    # 便利メソッド（/export で使う）
    def to_export_record(self) -> dict:
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if hasattr(self.created_at, "isoformat") else str(self.created_at),
            "class_id": self.class_id,
            "emotion": self.emotion,
            "score": self.score,
            "relationship_mention": self.relationship_mention,
            "negation_index": self.negation_index,
            "avoidance": self.avoidance,
            "labels": self.labels,
            "topic_tags": self.topic_tags,
        }
