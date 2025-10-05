# app/core/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager  # ← 追加

SQLALCHEMY_DATABASE_URL = "sqlite:///./nolik.db"  # 既存の設定に合わせて
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI の Depends 用ジェネレータ"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope():
    """
    使い捨てのDBセッションを安全に扱うためのスコープ付きコンテキスト。
    commit/rollbackを自動処理する。
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    モデルを **先に import** して Base.metadata にマップさせてから create_all。
    """
    from app.models import orm as _  # noqa: F401
    Base.metadata.create_all(bind=engine, checkfirst=True)
