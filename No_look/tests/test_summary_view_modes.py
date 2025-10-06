# tests/test_summary_view_modes.py
import importlib
from fastapi.testclient import TestClient

def make_client():
    m = importlib.import_module("app.main")
    return TestClient(m.app)

def test_summary_compact_and_full():
    c = make_client()
    for v in ("compact", "full"):
        r = c.get(f"/summary?days=7&tz=Asia/Tokyo&view={v}")
        assert r.status_code == 200
        js = r.json()
        # 共通フィールド
        assert "headline" in js and "kpi" in js and "coach" in js
        # モード差分
        if v == "compact":
            assert "daily" not in js and "totals" not in js
        else:
            assert "daily" in js and "totals" in js
