# app/core/errors.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

try:
    # openai v1 系
    from openai import OpenAIError, RateLimitError, APITimeoutError
except Exception:  # ライブラリ未導入/古い場合に備えたフォールバック
    class OpenAIError(Exception): ...
    class RateLimitError(OpenAIError): ...
    class APITimeoutError(OpenAIError): ...

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ValueError)
    async def handle_value_error(request: Request, exc: ValueError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(RateLimitError)
    async def handle_rate_limit(request: Request, exc: RateLimitError):
        return JSONResponse(
            status_code=503,
            content={"detail": "LLM が過負荷です。しばらくしてから再試行してください。"}
        )

    @app.exception_handler(APITimeoutError)
    async def handle_timeout(request: Request, exc: APITimeoutError):
        return JSONResponse(
            status_code=504,
            content={"detail": "LLM 応答がタイムアウトしました。フォールバック応答を返します。"}
        )

    @app.exception_handler(OpenAIError)
    async def handle_openai_error(request: Request, exc: OpenAIError):
        return JSONResponse(
            status_code=502,
            content={"detail": "LLM 呼び出しでエラーが発生しました。"}
        )
