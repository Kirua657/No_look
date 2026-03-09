# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Dict, List, Tuple

EMOTION_ORDER = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]


def _pct(n: int, d: int) -> int:
    """比率を整数パーセントで返す（除算ゼロ回避）"""
    return 0 if d == 0 else round(n * 100 / d)


def _top_key(counts: Dict[str, int]) -> str:
    """最頻感情を取得（同値なら定義順優先）"""
    return "中立" if sum(counts.values()) == 0 else max(
        EMOTION_ORDER, key=lambda k: (counts.get(k, 0), -EMOTION_ORDER.index(k))
    )


def _detect_peak_day(daily: List[Dict]) -> Tuple[str | None, int]:
    """投稿数が最多の日付と件数を返す"""
    peak_day, peak_cnt = None, -1
    for d in daily:
        c = sum(d["counts"].values())
        if c > peak_cnt:
            peak_cnt, peak_day = c, d["date"]
    return peak_day, peak_cnt


def _half_shift(daily: List[Dict]) -> List[str]:
    """前半→後半で感情が増減した項目を検出"""
    mid = len(daily) // 2 or 1
    first = {k: 0 for k in EMOTION_ORDER}
    second = {k: 0 for k in EMOTION_ORDER}
    for i, d in enumerate(daily):
        box = first if i < mid else second
        for k, v in d["counts"].items():
            box[k] += v
    shift = []
    for k in ["楽しい", "悲しい", "怒り", "不安", "しんどい"]:
        if first[k] < second[k]:
            shift.append(f"{k}↑")
        elif first[k] > second[k]:
            shift.append(f"{k}↓")
    return shift


def _ascii_bars_lines(totals: Dict[str, int]) -> List[str]:
    """棒グラフ風ASCII（相対比）"""
    total_posts = sum(totals.values())
    if total_posts == 0:
        return ["(データなし)"]
    max_cnt = max(totals.values()) or 1
    lines = []
    for k in EMOTION_ORDER:
        cnt = totals.get(k, 0)
        pct = _pct(cnt, total_posts)
        bar_len = 0 if max_cnt == 0 else round(cnt * 10 / max_cnt)
        bar = "█" * bar_len
        lines.append(f"{k:<4} | {cnt:>3}件 | {pct:>3}% | {bar}")
    return lines


def _teacher_suggestions(totals: Dict[str, int], shift: List[str]) -> Dict[str, object]:
    """教師向けコメント・リスク判定"""
    total = sum(totals.values())
    pos = totals.get("楽しい", 0)
    neg = totals.get("不安", 0) + totals.get("しんどい", 0) + totals.get("悲しい", 0) + totals.get("怒り", 0)

    suggestions: List[str] = []
    risk_level = "low"

    # 1) 安全・ケア系
    if total and (totals.get("不安", 0) + totals.get("しんどい", 0)) >= max(5, round(total * 0.35)):
        risk_level = "high"
        suggestions.append("不安・しんどいが多め。短いアンケート or 休み時間の個別声かけを1～2名に。")
    elif total and neg > pos:
        risk_level = "medium"
        suggestions.append("ネガ成分がやや優勢。ホームルームで『今週の良かったこと』を1人1つ共有。")

    # 2) ポジティブ増幅
    if pos >= max(5, round(total * 0.5)):
        suggestions.append("ポジティブ傾向。成功体験の共有タイムを5分入れて雰囲気を底上げ。")

    # 3) 変化（前半→後半）
    if "不安↑" in shift:
        suggestions.append("後半に不安が増加。小テスト/行事前後の説明と見通し提示を。")
    if "怒り↑" in shift:
        suggestions.append("後半に怒りが増加。ルール確認は“理由説明＋代替案”で落ち着かせる。")

    # 4) デフォルトの一言
    if not suggestions:
        suggestions.append("感情は安定傾向。週明けに先週の良かった点を3つ振り返ると◎。")

    color_map = {
        "low": {"color": "#4CAF50", "label": "安定（緑）"},
        "medium": {"color": "#FFD700", "label": "注意（黄）"},
        "high": {"color": "#FF6B6B", "label": "要対応（赤）"},
    }
    c = color_map.get(risk_level, color_map["low"])

    return {
        "risk_level": risk_level,
        "risk_color": c["color"],
        "risk_label": c["label"],
        "suggestions": suggestions,
    }


def generate_week_summary_view(
    days: int,
    class_id: str | None,
    totals: Dict[str, int],
    daily: List[Dict],
) -> Dict[str, object]:
    """週報まとめ生成（headline / ascii / coachコメントなど）
    - 返り値の ASCII は view 側では `ascii_rows`（配列）
    - ルーター側で結合し、トップレベル `ascii_pretty`（文字列）として返す
    """
    total_posts = sum(totals.values())
    top = _top_key(totals)
    top_pct = _pct(totals.get(top, 0), total_posts)
    peak_day, peak_cnt = _detect_peak_day(daily)
    shift = _half_shift(daily)

    daily_compact = [
        {
            "date": d["date"],
            "total": sum(d["counts"].values()),
            "top": _top_key(d["counts"]),
        }
        for d in daily
    ]

    headline = (
        f"{(class_id + ' / ') if class_id else ''}{days}日: "
        f"投稿{total_posts}件・最多「{top}」{top_pct}%"
    )
    text_short = f"{class_id or '全体'}: {top}が最多 ({top_pct}%) / 合計{total_posts}件"

    highlights = []
    if peak_day:
        highlights.append(f"投稿最多: {peak_day}（{peak_cnt}件）")
    if shift:
        highlights.append("前半→後半: " + "・".join(shift))

    ascii_lines = _ascii_bars_lines(totals)
    text = f"直近{days}日、投稿{total_posts}件。最多は「{top}」（{top_pct}%）。"
    if peak_day:
        text += f" 最多日は {peak_day}。"
    if shift:
        text += f" 傾向: {'・'.join(shift)}。"

    coach = _teacher_suggestions(totals, shift)

    return {
        "headline": headline,
        "text_short": text_short,
        "kpi": {"total": total_posts, "top": top, "top_pct": top_pct},
        "highlights": highlights,
        "daily_compact": daily_compact,
        "ascii_rows": ascii_lines,   # ← ★ ここだけ `ascii_rows` に変更
        "text": text,
        "coach": coach,  # {risk_level, risk_color, risk_label, suggestions[]}
    }
