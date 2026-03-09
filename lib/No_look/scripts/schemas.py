from __future__ import annotations
from typing import List, Optional, Dict
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.config import CLASS_ID_STRICT, CLASS_ID_DEFAULT
from app.services.normalizer import normalize_emotion

# ===== 基本Enum =====
class Emotion(str, Enum):
    fun = "楽しい"
    sad = "悲しい"
    angry = "怒り"
    anxious = "不安"
    tired = "しんどい"
    neutral = "中立"

# ===== 入力 =====
class AnalyzeInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str = Field(..., description="ユーザー入力テキスト（保存しない方針。処理後は破棄）")
    class_id: Optional[str] = Field(None, description="クラスやグループの識別子")
    selected_emotion: Optional[Emotion | str] = Field(
        None, description="手動選択がある場合はこの値を最優先"
    )
    topic_hint: Optional[List[str]] = Field(
        default=None, description="UIタグなど（例：['部活','友達']）"
    )

    # --- バリデータ ---
    @field_validator("selected_emotion", mode="before")
    @classmethod
    def _normalize_selected(cls, v):
        """ふあん/怒怒りり/楽しかった！ などを正規化して Emotion に変換"""
        if v is None or isinstance(v, Emotion):
            return v
        norm = normalize_emotion(str(v))
        if norm is None:
            raise ValueError("selected_emotion は 楽しい/悲しい/怒り/不安/しんどい/中立 に正規化できません。")
        for e in Emotion:
            if e.value == norm:
                return e
        raise ValueError("selected_emotion の正規化に失敗しました。")

    @field_validator("class_id")
    @classmethod
    def _validate_or_default_class_id(cls, v):
        """class_id のバリデーション方針（STRICTなら必須, 非STRICTなら既定値）"""
        if CLASS_ID_STRICT:
            if v is None or not str(v).strip():
                raise ValueError("class_id は必須です。")
            return str(v).strip()
        return (str(v).strip() if v and str(v).strip() else CLASS_ID_DEFAULT)

# ===== OpenAPI 用サンプル =====
EXAMPLE_ANALYZE_INPUT: Dict = {
    "text": "体育祭で自己ベスト！めっちゃ嬉しい！",
    "class_id": "1-A",
    "selected_emotion": "ふあん！！",
    "topic_hint": ["学校行事"]
}

if __name__ == "__main__":
    # テスト実行
    print(AnalyzeInput(**EXAMPLE_ANALYZE_INPUT).model_dump())
