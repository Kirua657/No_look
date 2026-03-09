from __future__ import annotations
from typing import List, Optional, Literal, Dict
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, conlist, confloat, field_validator
from typing import Annotated
from pydantic import BaseModel, Field, ConfigDict, field_validator

# ===== 基本Enum =====
class Emotion(str, Enum):
    fun = "楽しい"
    sad = "悲しい"
    angry = "怒り"
    anxious = "不安"
    tired = "しんどい"
    neutral = "中立"

# 0.0〜1.0 のスコア
Score = Annotated[float, Field(ge=0.0, le=1.0)]

# ===== 入力 =====
class AnalyzeInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str = Field(..., description="ユーザー入力テキスト（保存しない方針。処理後は破棄）")
    class_id: Optional[str] = Field(None, description="クラスやグループの識別子")
    selected_emotion: Optional[Emotion] = Field(
        None, description="手動選択がある場合はこの値を最優先"
    )
    topic_hint: Optional[List[str]] = Field(
        default=None, description="UIタグなど（例：['部活','友達']）"
    )

# ===== Signals: ルール/特徴量 =====
class Signals(BaseModel):
    model_config = ConfigDict(extra="forbid")
    relationship_mention: bool = Field(False, description="人間関係の明示的な言及があるか")
    negation_index: int = Field(0, ge=0, description="否定語の出現回数など")
    avoidance: int = Field(0, ge=0, description="回避・逃避傾向の兆候数")
    topic_tags: List[str] = Field(default_factory=list, description="抽出/付与タグ")

# ===== Moderation: 安全系 =====
class ModerationFlag(BaseModel):
    model_config = ConfigDict(extra="forbid")
    is_flagged: bool = Field(False, description="要注意かどうか")
    reasons: List[str] = Field(default_factory=list, description="フラグ理由のコード/短文")
    note: Optional[str] = Field(None, description="内向け簡易メモ（保存しない/出力しないことも可）")

# ===== Labels: 6分類の確率分布(one-hot可) =====
class Labels(BaseModel):
    model_config = ConfigDict(extra="forbid")
    楽しい: Score
    悲しい: Score
    怒り: Score
    不安: Score
    しんどい: Score
    中立: Score

    @field_validator("*")
    @classmethod
    def _clip(cls, v: float) -> float:
        # 念のためクリップ
        return max(0.0, min(1.0, float(v)))

# ===== 出力（/analyze） =====
class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    # メイン推定
    emotion: Emotion = Field(..., description="最終ラベル（手動が来たらそれを優先）")
    score: Score = Field(..., description="最終ラベルの確信度 0.0〜1.0")
    labels: Labels = Field(..., description="6分類スコア（合計1.0想定だが厳密強制はしない）")
    # 付随情報
    signals: Signals = Field(default_factory=Signals)
    moderation: ModerationFlag = Field(default_factory=ModerationFlag)
    # メタ
    class_id: Optional[str] = None
    created_at: Optional[str] = Field(None, description="ISO8601（サーバ側付与）")
    # 互換
    version: Literal["v1"] = "v1"

# ===== エクスポート行（/export） =====
class ExportRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: int
    created_at: str
    class_id: Optional[str]
    emotion: Emotion
    score: Score
    relationship_mention: bool
    negation_index: int
    avoidance: int
    labels: Dict[str, float]  # {"楽しい":0.0, ...}
    topic_tags: List[str]

# ===== OpenAPI 用サンプル =====
EXAMPLE_ANALYZE_INPUT: Dict = {
    "text": "体育祭で自己ベスト！めっちゃ嬉しい！",
    "class_id": "1-A",
    "selected_emotion": None,
    "topic_hint": ["部活", "学校行事"]
}

EXAMPLE_ANALYZE_RESULT: Dict = {
    "emotion": "楽しい",
    "score": 0.95,
    "labels": {
        "楽しい": 0.95, "悲しい": 0.0, "怒り": 0.0, "不安": 0.02, "しんどい": 0.0, "中立": 0.03
    },
    "signals": {
        "relationship_mention": False, "negation_index": 0, "avoidance": 0, "topic_tags": ["学校行事"]
    },
    "moderation": {"is_flagged": False, "reasons": []},
    "class_id": "1-A",
    "created_at": "2025-09-23T12:34:56Z",
    "version": "v1"
}

EXAMPLE_EXPORT_RECORD: Dict = {
    "id": 42,
    "created_at": "2025-09-23T12:34:56Z",
    "class_id": "1-A",
    "emotion": "中立",
    "score": 1.0,
    "relationship_mention": False,
    "negation_index": 0,
    "avoidance": 0,
    "labels": {"楽しい":0.0,"悲しい":0.0,"怒り":0.0,"不安":0.0,"しんどい":0.0,"中立":1.0},
    "topic_tags": ["部活"]
}
