import os, sys
from fastapi.testclient import TestClient
import pytest

# プロジェクト直下を import パスに追加（ModuleNotFoundError 対策）
sys.path.append(os.path.abspath("."))

# テスト用の環境変数（あなたの実装に合わせて後で調整OK）
@pytest.fixture(autouse=True)
def test_env(monkeypatch):
    monkeypatch.setenv("NOLOOK_MANUAL_ONLY", "0")
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost,http://127.0.0.1")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test_tmp.db")

@pytest.fixture(scope="session")
def app():
    # あなたの FastAPI アプリの import パスに合わせて変更
    # 例: genai/main.py に app がある想定
    from genai.main import app as fastapi_app
    return fastapi_app

@pytest.fixture
def client(app):
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def app():
    from genai.main import app as fastapi_app
    return fastapi_app

@pytest.fixture
def client(app):
    # テスト用APIキーを環境変数から取得（無ければ "test-key" を使う）
    api_key = os.getenv("API_KEY", "test-key")
    headers = {"Authorization": f"Bearer {api_key}"}
    with TestClient(app, headers=headers) as c:
        yield c