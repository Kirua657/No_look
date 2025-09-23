# tests/test_export.py
import importlib
from fastapi.testclient import TestClient

def make_client():
    mod = importlib.import_module("genai.main")
    return TestClient(mod.app)

def test_export_json_and_xlsx():
    c = make_client()

    # 1件保存（/analyze 経由でもOK）
    r = c.post("/analyze", json={"text": "今日は自己ベスト！", "class_id": None})
    assert r.status_code == 200
    body = r.json()
    assert "emotion" in body and "labels" in body

    # JSON エクスポート
    rj = c.get("/export?format=json")
    assert rj.status_code == 200
    data = rj.json()
    assert isinstance(data, list) and len(data) >= 1
    assert set(data[0]).issuperset({"id", "created_at", "emotion"})

    # XLSX エクスポート
    rx = c.get("/export?format=xlsx")
    assert rx.status_code == 200
    # Content-Type とサイズざっくりチェック
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in rx.headers.get("content-type", "")
    assert len(rx.content) > 1024
