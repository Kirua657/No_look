# -*- coding: utf-8 -*-
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

# 共通の感情キー
EMOTIONS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

class DayItem(BaseModel):
    """1日分の集計"""
    date: str = Field(..., description="日付 (YYYY-MM-DD)")
    counts: Dict[str, int] = Field(..., description="感情ごとの件数")
    ratios: Dict[str, float] = Field(..., description="感情ごとの比率 (0.0〜1.0)")
    total: int = Field(..., description="当日合計件数")

class DashboardResponse(BaseModel):
    """教師ダッシュボード・週報共通レスポンス（基本構造）"""
    class_id: Optional[str] = Field(None, description="クラスID（例: 1-A）")
    range_days: int = Field(..., ge=1, le=60, description="集計対象日数")
    start_date: str = Field(..., description="開始日 (YYYY-MM-DD)")
    end_date: str = Field(..., description="終了日 (YYYY-MM-DD)")
    daily: List[DayItem] = Field(..., description="日別データ一覧")

# 週報拡張（headline/coach/ascii_pretty/view）
class WeeklyReportResponse(DashboardResponse):
    """週報用レスポンス（headline/coach/ascii_pretty/view を追加）"""
    headline: Optional[str] = Field(None, description="週全体の要約見出し")
    coach: Optional[Dict[str, object]] = Field(None, description="教師へのアドバイス（レベルや色、提案配列など）")
    ascii_pretty: Optional[str] = Field(None, description="ASCIIグラフ風の週推移表示（改行結合済み）")
    view: Optional[Dict[str, object]] = Field(None, description="generate_week_summary_view の生出力")