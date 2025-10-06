# tests/test_metrics.py
from importlib import import_module
from fastapi.testclient import TestClient

def test_metrics_endpoint_exposes_prom():
    mod = import_module("app.main")
    app = getattr(mod, "app")
    c = TestClient(app)
    r = c.get("/metrics")
    assert r.status_code == 200
    assert r.text.startswith("# HELP")
    assert "nolik_http_requests_total" in r.text
