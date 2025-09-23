import os, sys
from fastapi.testclient import TestClient
import importlib
import pytest
import warnings
try:
    # LangChain 0.1.17+ あたり
    from langchain_core._api import LangChainDeprecationWarning
except Exception:
    # 念のためフォールバック（古い/将来のバージョンで import 失敗してもテストは進む）
    class LangChainDeprecationWarning(Warning):
        pass

# LLMChain クラス非推奨の警告を黙らせる
warnings.filterwarnings(
    "ignore",
    message=r"The class `LLMChain` was deprecated",
    category=LangChainDeprecationWarning,
)
# Chain.run 非推奨の警告を黙らせる（念のため）
warnings.filterwarnings(
    "ignore",
    message=r"The method `Chain\.run` was deprecated",
    category=LangChainDeprecationWarning,
)
# まとめて無条件で無視したい場合は下でもOK（上2つの代わりに）
# warnings.filterwarnings("ignore", category=LangChainDeprecationWarning)

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

@pytest.fixture(autouse=True)
def no_auth_and_no_rate(monkeypatch):
    # すべてのテストで認証とレート制限をオフ
    monkeypatch.delenv("API_KEY", raising=False)
    monkeypatch.setenv("NOLOOK_RATE_LIMIT_PER_MIN", "0")

    # 既に import 済みなら上書き（FastAPIの依存も潰す）
    try:
        main = importlib.import_module("genai.main")
        main.API_KEY = None
        main.RATE_PER_MIN = 0
        main.app.dependency_overrides[main.verify_api_key] = lambda: True
        main.app.dependency_overrides[main.rate_limit] = lambda: True
    except Exception:
        main = None

    yield

    if main is not None:
        main.app.dependency_overrides.clear()