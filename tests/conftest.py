# tests/conftest.py
import os
import tempfile
import importlib
import builtins
from typing import Optional, Tuple

import pytest
from fastapi.testclient import TestClient

def _build_app_with_env(tmp_dir: Optional[str] = None):
    # 一時 SQLite DB を毎回用意
    if tmp_dir is None:
        tmp_dir = tempfile.mkdtemp(prefix="nlltest_")
    db_path = os.path.join(tmp_dir, "test.db")
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    # 既定のテスト用設定（各テストで monkeypatch 可能）
    os.environ.setdefault("NOLOOK_CLASS_ID_STRICT", "0")
    os.environ.setdefault("NOLOOK_CLASS_ID_DEFAULT", "default")
    os.environ.setdefault("NOLOOK_MANUAL_ONLY", "0")
    os.environ.setdefault("DISABLE_RATE_LIMIT", "1")

    # 依存→本体の順で再読み込み（環境変数を反映）
    import app.core.db as coredb
    import app.main as mainmod
    importlib.reload(coredb)
    importlib.reload(mainmod)

    # テーブル作成
    if hasattr(coredb, "init_db"):
        coredb.init_db()

    return mainmod.app, tmp_dir

def make_client(tmp_path: Optional[os.PathLike] = None) -> Tuple[object, TestClient]:
    tmp_dir = str(tmp_path) if tmp_path is not None else None
    app, used_tmp_dir = _build_app_with_env(tmp_dir)
    client = TestClient(app)

    class Meta:
        tmpdir = used_tmp_dir

    return Meta(), client

# 一部テストが make_client を直接呼ぶので builtins に公開
builtins.make_client = make_client

# “client” フィクスチャ（共通で欲しいテスト用）
@pytest.fixture
def client() -> TestClient:
    _, c = make_client(None)
    return c
