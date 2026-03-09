"""Core emotion-detection rules shared between app and tools."""

from __future__ import annotations

import re
from typing import Optional, Tuple


def detect_emotion_6(text: str, prev_emotion: Optional[str] = None) -> Tuple[str, float]:
    """
    6感情（楽しい / 悲しい / 怒り / 不安 / しんどい / 中立）を判定する（改善版）。
    ★ 正規表現で語幹を拾うので「楽しく」「楽しくなって」「はまってる」も検出
    ★ 危険ワードは最優先
    ★ 何もヒットしなければ「中立」
    ★ 改善②：スコアが全て0（新たにマッチするワードなし）なら前フレーム感情を継続
    """

    preview = (text or "")[:50].replace("\n", " ")
    print(f"🔍 [detect_emotion_6] text='{preview}', prev={prev_emotion}")

    if not text:
        if prev_emotion in ("楽しい", "悲しい", "怒り", "不安", "しんどい"):
            return prev_emotion, 0.5
        return "中立", 0.3

    lower = text.lower()

    # ★ 危険ワード（最優先）
    crisis_words = ["死にたい", "消えたい", "いなくなりたい", "自殺", "リスカ", "もう無理"]
    if any(w in lower for w in crisis_words):
        return "しんどい", 0.98

    # 好きと嫌いの葛藤はしんどい寄り
    if re.search(r"(好き).*(嫌い)|(嫌い).*(好き)", lower):
        return "しんどい", 0.7

    scores = {
        "楽しい": 0.0,
        "悲しい": 0.0,
        "怒り": 0.0,
        "不安": 0.0,
        "しんどい": 0.0,
        "中立": 0.0,
    }

    EMOTION_PATTERNS = {
        "楽しい": [
            r"楽しい", r"楽しかっ", r"楽しく", r"楽しくなって",
            r"嬉しい", r"うれし", r"嬉しかっ", r"うれしかっ",
            r"幸せ", r"しあわせ",
            r"最高", r"サイコー",
            r"よかった", r"良かった",
            r"ワクワク", r"わくわく",
            r"好き", r"大好き",
            r"はまってる", r"ハマってる",
            r"楽しみ", r"面白い", r"おもしろい",
            r"褒められ", r"ほめられ",
            r"褒めてくれた", r"ほめてくれた",
            r"うまく描け", r"上手く描け", r"うまくできた", r"上手くできた",
            r"うまくいっ", r"上手くいっ",
            r"学校.*楽しい",
            r"友達.*楽しい",
            r"楽しくて",
            r"爆笑", r"腹筋崩壊",
            r"神回", r"優勝レベル", r"優勝だった",
            r"楽しすぎ", r"楽しすぎた",
            r"エモい",
            r"気がラクになった", r"ちょっとラクになった",
            r"ホッとした", r"ほっとした",
            r"救われた気がする", r"気持ちが軽くなった",
        ],
        "悲しい": [
            r"悲しい", r"かなしい", r"悲しかっ",
            r"辛い", r"つらい",
            r"寂し", r"さみし",
            r"落ち込", r"萎え", r"萎えた",
            r"泣きたい", r"泣いた", r"泣いて", r"涙",
            r"ショック", r"へこむ", r"へこんだ",
        ],
        "怒り": [
            r"怒", r"ムカつく", r"むかつく",
            r"腹立", r"イライラ", r"いらいら",
            r"うざい", r"ウザい",
            r"許せない", r"キレた", r"キレそう",
            r"ブチギレ", r"キレそうだ", r"腹立つ",
            r"理不尽",
            r"納得いかない",
            r"悔し",
        ],
        "不安": [
            r"不安", r"心配", r"しんぱい",
            r"怖い", r"こわい",
            r"緊張", r"ドキドキ", r"どきどき",
            r"やばい", r"ヤバい",
            r"どうしよう",
            r"テスト", r"試験", r"受験",
            r"発表", r"面接",
            r"どうやったら.*できる",
            r"どうしたら.*できる",
            r"うまくいくか分からない",
            r"怒られそう",
        ],
        "しんどい": [
            r"疲れ", r"つかれ", r"疲れた",
            r"しんどい",
            r"大変", r"たいへん",
            r"きつい", r"きつかった",
            r"だるい", r"だるかった",
            r"眠い", r"ねむい",
            r"分からん", r"わからん", r"分かんない", r"わかんない",
            r"難しい", r"むずかしい",
            r"困った",
            r"めんどくさい", r"めんどう", r"面倒",
            r"苦しい", r"つらい",
            r"無理",
            r"もう無理", r"無理すぎ", r"無理だ", r"限界", r"無理かも",
            r"できない",
            r"苦手",
            r"モヤモヤ", r"もやもや",
        ],
    }

    for emo, patterns in EMOTION_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, lower):
                scores[emo] += 1.0

    print(f"🔍 [detect_emotion_6] scores={scores}")

    # あいさつ系は中立を少し上げる
    if re.search(r"(こんにちは|おはよう|こんばんは|お疲れ|おつかれ)", lower):
        scores["中立"] += 0.5

    # 「無理しないでね」系はネガ軽減
    if re.search(r"無理(しない|しなくていい|しないで|せず)", lower):
        scores["しんどい"] = max(0.0, scores["しんどい"] - 1.0)

    # 何もヒットしない → 前フレーム継続 or 中立
    if all(v == 0 for v in scores.values()):
        if prev_emotion in ("しんどい", "不安", "悲しい", "楽しい", "怒り"):
            print(f"🔍 [detect_emotion_6] fallback prev={prev_emotion} -> {prev_emotion}")
            return prev_emotion, 0.4
        print("🔍 [detect_emotion_6] fallback -> 中立 (no hits)")
        return "中立", 0.3

    sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_emotion, top_score = sorted_items[0]
    second_emotion, second_score = sorted_items[1]

    total = sum(scores.values())
    base_conf = min(0.9, max(0.5, (top_score / (total + 1e-6)) + 0.3))

    positive_set = {"楽しい"}
    negative_set = {"悲しい", "怒り", "不安", "しんどい"}

    # ★ ① ポジだけ立っている場合は素直にポジで返す
    if top_emotion in positive_set and all(scores[e] == 0.0 for e in negative_set):
        print(f"🔍 [detect_emotion_6] pure positive -> {top_emotion}, conf={base_conf:.2f}")
        return top_emotion, base_conf

    # ★ ② ポジ×ネガ混合 → second_score > 0 のときだけ「しんどい」に圧縮
    if (
        top_emotion in positive_set
        and second_emotion in negative_set
        and second_score > 0  # ← ここ追加
        and abs(top_score - second_score) <= 1.0
    ) or (
        top_emotion in negative_set
        and second_emotion in positive_set
        and second_score > 0  # ← ここ追加
        and abs(top_score - second_score) <= 1.0
    ):
        mixed_conf = min(base_conf, 0.8)
        print(
            f"🔍 [detect_emotion_6] mixed pos/neg -> しんどい "
            f"(top={top_emotion}:{top_score}, second={second_emotion}:{second_score}, conf={mixed_conf:.2f})"
        )
        return "しんどい", max(0.6, mixed_conf)

    # 否定パターンの後処理（例: 「そこまでしんどくない」）
    def has(pattern: str) -> bool:
        return re.search(pattern, text) is not None

    if "しんど" in text and has(r"(しんどくない|大丈夫|そこまでしんどくない)"):
        print("🔍 [detect_emotion_6] negation override -> 中立 (しんどくない系)")
        return "中立", 0.5

    if "不安" in text and has(r"(不安ってわけじゃない|そこまで不安|不安ではない)"):
        print("🔍 [detect_emotion_6] negation override -> 中立 (不安ではない)")
        return "中立", 0.5

    if has(r"昨日.*しんどかった") and has(r"今日は.*大丈夫"):
        print("🔍 [detect_emotion_6] recovery pattern -> 中立")
        return "中立", 0.6

    print(f"🔍 [detect_emotion_6] result={top_emotion}, conf={base_conf:.2f}")
    return top_emotion, base_conf


__all__ = ["detect_emotion_6"]
