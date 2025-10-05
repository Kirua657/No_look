# app/config.py
import os
CLASS_ID_STRICT = os.getenv("NOLOOK_CLASS_ID_STRICT", "1") == "1"
CLASS_ID_DEFAULT = os.getenv("NOLOOK_CLASS_ID_DEFAULT", "default")  # STRICT=0 の時だけ使用

# app/routes/_shared.py
from pydantic import BaseModel, field_validator
from app.config import CLASS_ID_STRICT, CLASS_ID_DEFAULT

class RequireClassId(BaseModel):
    class_id: str | None = None

    @field_validator("class_id")
    @classmethod
    def _require_or_default(cls, v):
        if CLASS_ID_STRICT:
            if not v or not v.strip():
                raise ValueError("class_id は必須です。")
            return v.strip()
        # STRICT=0 の場合はデフォルトへ
        return (v or CLASS_ID_DEFAULT).strip()
