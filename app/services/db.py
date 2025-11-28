# app/services/db.py
from __future__ import annotations
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

# ======== DB設定 ========
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./no_look.db")

# SQLite用: スレッド間アクセスを許可
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

# ======== Engine作成 ========
engine = create_engine(
    DB_URL,
    echo=False,          # TrueにするとSQLログが出る（開発時だけ）
    future=True,
    connect_args=connect_args,
    pool_pre_ping=True,  # コネクション切断検知
)

# ======== SQLite用チューニング ========
if DB_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """SQLiteの安全性と性能を向上させる"""
        cursor = dbapi_connection.cursor()
        # WALモード（同時読み書きが高速＆安全）
        cursor.execute("PRAGMA journal_mode=WAL;")
        # 同期モード（NORMALで速度重視）
        cursor.execute("PRAGMA synchronous=NORMAL;")
        # 忙しいときのリトライ時間（ミリ秒）
        cursor.execute("PRAGMA busy_timeout=3000;")
        # 一時データをメモリに
        cursor.execute("PRAGMA temp_store=MEMORY;")
        # 外部キー制約を有効に
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

# ======== セッション作成 ========
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# ======== 依存関数 ========
def get_db():
    """FastAPIの依存関数：DBセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
