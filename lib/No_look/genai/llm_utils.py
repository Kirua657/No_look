# genai/llm_utils.py （新規）
from typing import Any

def coerce_text(raw: Any) -> str:
    # AIMessage / BaseMessage
    if hasattr(raw, "content"):
        return str(getattr(raw, "content"))
    # LangChain Runnable で dict を返す場合
    if isinstance(raw, dict):
        # {"text": "..."} or {"output_text": "..."} などを優先的に拾う
        for k in ("text", "output_text", "content", "result"):
            if k in raw and isinstance(raw[k], (str, int, float)):
                return str(raw[k])
        # 文字列っぽい値にフォールバック
        try:
            return str(raw)
        except Exception:
            return ""
    # それ以外（文字列/数値など）
    try:
        return str(raw)
    except Exception:
        return ""
