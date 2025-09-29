import os, sys, pytest
from fastapi.testclient import TestClient

# ルートを sys.path 先頭に
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app.main import app

@pytest.fixture
def client():
    return TestClient(app)
