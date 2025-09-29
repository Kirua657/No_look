import os
import time
import uuid
import threading
from typing import Dict, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

# =========================================================
# 1) RequestIdMiddleware
#    各リクエストに request_id を付与してレスポンスにも返す
# =========================================================
class RequestIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        rid = str(uuid.uuid4())
        # request.state 経由でハンドラや他ミドルウェアから参照できる
        request.state.request_id = rid
        response: Response = await call_next(request)
        response.headers["x-request-id"] = rid
        return response


# =========================================================
# 2) ApiKeyMiddleware
#    API_KEY が設定されているときのみ X-API-Key を要求
#    開発で無効化したいときは .env の API_KEY を空に
# =========================================================
class ApiKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.api_key = (os.getenv("API_KEY") or "").strip()
        self.enabled = bool(self.api_key)
        # 認証をスキップする安全パス（必要に応じて追加）
        self.safe_paths = {
            "/",
            "/docs",
            "/openapi.json",
            "/metrics",
            "/health",
        }

    async def dispatch(self, request: Request, call_next):
        if not self.enabled:
            return await call_next(request)

        if request.url.path in self.safe_paths:
            return await call_next(request)

        if request.headers.get("X-API-Key") == self.api_key:
            return await call_next(request)

        rid = getattr(getattr(request, "state", None), "request_id", None)
        return JSONResponse(
            status_code=403,
            content={"detail": "Forbidden", "request_id": rid},
        )


# =========================================================
# 3) RateLimitMiddleware
#    1分あたりの回数制限（IP×Path）
#    ヘッダ: x-ratelimit-limit / -remaining / -reset
# =========================================================
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.limit = int(os.getenv("NOLOOK_RATE_LIMIT_PER_MIN", "60"))
        self.window = 60  # 秒
        # 共有メモリ（プロセス内）
        self._store: Dict[Tuple[str, str], Tuple[int, float]] = {}
        self._lock = threading.Lock()

    def _key(self, request: Request) -> Tuple[str, str]:
        ip = request.client.host if request.client else "unknown"
        path = request.url.path
        return (ip, path)

    def _cleanup(self):
        # 古いウィンドウは削除（簡易）
        now = time.time()
        with self._lock:
            for k in list(self._store.keys()):
                count, start = self._store[k]
                if now - start >= self.window:
                    del self._store[k]

    async def dispatch(self, request: Request, call_next):
        self._cleanup()
        key = self._key(request)
        now = time.time()

        with self._lock:
            count, start = self._store.get(key, (0, now))
            if now - start >= self.window:
                # 新しいウィンドウ
                count, start = 0, now
            count += 1
            self._store[key] = (count, start)
            remaining = max(self.limit - count, 0)
            reset_in = int(self.window - (now - start))

        # ヘッダは常に付与
        def _add_headers(resp: Response):
            resp.headers["x-ratelimit-limit"] = str(self.limit)
            resp.headers["x-ratelimit-remaining"] = str(remaining)
            resp.headers["x-ratelimit-reset"] = str(reset_in)
            return resp

        if count > self.limit:
            rid = getattr(getattr(request, "state", None), "request_id", None)
            resp = JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests", "request_id": rid},
            )
            return _add_headers(resp)

        # 通常処理
        response: Response = await call_next(request)
        return _add_headers(response)
