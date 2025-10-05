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
# =========================================================
class RequestIdMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        rid = str(uuid.uuid4())
        request.state.request_id = rid
        response: Response = await call_next(request)
        response.headers["x-request-id"] = rid
        return response


# =========================================================
# 2) ApiKeyMiddleware
# =========================================================
class ApiKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.api_key = (os.getenv("API_KEY") or "").strip()
        self.enabled = bool(self.api_key)
        self.safe_paths = {"/", "/docs", "/openapi.json", "/metrics", "/health"}

    async def dispatch(self, request: Request, call_next):
        if not self.enabled or request.url.path in self.safe_paths:
            return await call_next(request)
        if request.headers.get("X-API-Key") == self.api_key:
            return await call_next(request)
        rid = getattr(getattr(request, "state", None), "request_id", None)
        return JSONResponse(status_code=403, content={"detail": "Forbidden", "request_id": rid})


# =========================================================
# 3) RateLimitMiddleware
#    1分あたりの回数制限（IP×Path）
#    テスト中は完全無効化。/metrics 等は常に除外。
# =========================================================
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.limit = int(os.getenv("NOLOOK_RATE_LIMIT_PER_MIN", "60"))
        self.window = 60  # 秒
        self._store: Dict[Tuple[str, str], Tuple[int, float]] = {}
        self._lock = threading.Lock()
        self.allowlist = {"/", "/docs", "/openapi.json", "/metrics", "/health"}

    def _key(self, request: Request) -> Tuple[str, str]:
        ip = request.client.host if request.client else "unknown"
        path = request.url.path
        return (ip, path)

    def _cleanup(self):
        now = time.time()
        with self._lock:
            for k in list(self._store.keys()):
                count, start = self._store[k]
                if now - start >= self.window:
                    del self._store[k]


    async def dispatch(self, request: Request, call_next):
        # ---- バイパス条件 ----
        if os.getenv("PYTEST_CURRENT_TEST") or os.getenv("DISABLE_RATE_LIMIT") == "1":
            return await call_next(request)
        if request.scope.get("type") != "http":
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)
        if request.url.path in self.allowlist:
            return await call_next(request)
        # ---------------------

        self._cleanup()
        key = self._key(request)
        now = time.time()

        with self._lock:
            count, start = self._store.get(key, (0, now))
            if now - start >= self.window:
                count, start = 0, now
            count += 1
            self._store[key] = (count, start)
            remaining = max(self.limit - count, 0)
            reset_in = int(max(self.window - (now - start), 0))

        def _add_headers(resp: Response):
            resp.headers["x-ratelimit-limit"] = str(self.limit)
            resp.headers["x-ratelimit-remaining"] = str(remaining)
            resp.headers["x-ratelimit-reset"] = str(reset_in)
            return resp

        if count > self.limit:
            rid = getattr(getattr(request, "state", None), "request_id", None)
            resp = JSONResponse(status_code=429, content={"detail": "Too Many Requests", "request_id": rid})
            return _add_headers(resp)

        response: Response = await call_next(request)
        return _add_headers(response)
