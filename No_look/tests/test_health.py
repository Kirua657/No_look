def test_health_root(client):
    r = client.get("/")
    assert r.status_code in (200, 204)
