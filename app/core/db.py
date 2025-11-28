# app/core/db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

# =========================
# .env を読み込む（任意）
# =========================
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv()  # プロジェクトルートの .env を自動読込
except Exception:
    # 依存が無くても動作継続（環境変数があればそれを利用）
    pass

# =========================================================
# DB URL を .env から取得（なければ nolik.db にフォールバック）
# =========================================================
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nolik.db")

# ログ表示（デバッグ時のみ）
if os.getenv("DEBUG_DB", "0") == "1":
    print(f"[DB] Using database URL: {SQLALCHEMY_DATABASE_URL}")

# =========================================================
# エンジン作成
# =========================================================
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# =========================================================
# FastAPI Depends 用セッション
# =========================================================
def get_db():
    """FastAPI の Depends 用ジェネレータ"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================
# with 文用スコープ付きセッション
# =========================================================
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

# =========================================================
# 初期化（テーブル作成）
# =========================================================
def init_db() -> None:
    """
    モデルを **先に import** して Base.metadata にマップさせてから create_all。
    """
    from app.models import orm as _  # noqa: F401
    Base.metadata.create_all(bind=engine, checkfirst=True)
