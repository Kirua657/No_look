from __future__ import annotations
import os
import re
import json
from typing import Dict

from openai import OpenAI  # pip install openai

EMOTION_KEYS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

# ===== ここから: 旧ルールベース用の定義（フォールバックに使う） =====

WORD_WEIGHTS = {
    "楽しい": {
        r"(楽しい|嬉し|うれし|最高|自己ベスト|優勝|合格|盛れた|神った)": 1.8,
        r"(よかった|助かった|順調|ワクワク|楽しみ|期待してる|期待している)": 1.3,
        r"(自信|自信ある|自信あり|自信がある)": 1.4,
    },
    "悲しい": {
        r"(悲し|かなしい|落ち込|萎え|萎えた|泣きたい|ショック|へこむ)": 1.8,
        r"(失敗|ミス|うまくいかない|つらい)": 1.3,
    },
    "怒り": {
        r"(ムカつ|むかつ|イラつ|腹立|許せない|キレそう|納得いかない)": 1.8,
        r"(不公平|理不尽|雑|舐めてる|雑に)": 1.4,
    },
    "不安": {
        r"(不安|心配|焦る|焦っ|緊張|プレッシャ|間に合わない|大丈夫かな)": 1.8,
        r"(でも|けど|ただ|かも)": 0.6,
    },
    "しんどい": {
        r"(しんど|つら|きつ|だる|疲れ|つかれ|眠い|頭痛|体調悪)": 1.8,
        r"(限界|もう無理|休みたい)": 2.0,
    },
}

NEGATIONS = (r"ない", r"じゃない", r"なく", r"ません", r"できない", r"無理")

EXCLA_BOOST = 1.15
REPEAT_BOOST = 1.10
NEUTRAL_FLOOR = 0.45
WINNER_BONUS = 0.05

def _base_vec() -> Dict[str, float]:
    return {k: 0.0 for k in EMOTION_KEYS}

def _fallback_rule_analyze(text: str) -> Dict[str, float]:
    """LLMが失敗したとき用の旧ルールベース分析。"""
    t = text.strip()
    vec = _base_vec()

    for emo, patterns in WORD_WEIGHTS.items():
        for pat, w in patterns.items():
            for m in re.finditer(pat, t):
                vec[emo] += w
                tail = t[m.end(): m.end() + 5]
                if any(ng in tail for ng in NEGATIONS):
                    if emo == "楽しい":
                        vec["悲しい"] += w * 0.7
                        vec["不安"] += w * 0.5
                        vec[emo] -= w * 0.8
                    else:
                        vec["楽しい"] += w * 0.4
                        vec["中立"] += w * 0.3
                        vec[emo] -= w * 0.6

    if "！" in t or "!" in t:
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= EXCLA_BOOST
    if re.search(r"(?:ー{2,}|(.)\1{2,})", t):
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= REPEAT_BOOST

    total = sum(v for k, v in vec.items() if k != "中立")
    if total <= 0:
        vec = _base_vec()
        vec["中立"] = 1.0
        return vec

    for k in EMOTION_KEYS:
        if k != "中立":
            vec[k] = vec[k] / total

    max_label = max((k for k in EMOTION_KEYS if k != "中立"), key=lambda x: vec[x])
    max_val = vec[max_label]

    if max_val < NEUTRAL_FLOOR:
        out = _base_vec()
        out["中立"] = 1.0
        return out

    vec[max_label] = min(1.0, vec[max_label] + WINNER_BONUS)
    s = sum(vec[k] for k in EMOTION_KEYS if k != "中立")
    vec["中立"] = max(0.0, 1.0 - s)
    return vec

# ===== ここまで旧ロジック =====

def _ensure_vec_keys(vec: Dict[str, float] | None) -> Dict[str, float]:
    out = {k: 0.0 for k in EMOTION_KEYS}
    if vec:
        for k, v in vec.items():
            if k in out:
                try:
                    out[k] = float(max(0.0, v))
                except Exception:
                    out[k] = 0.0
    return out

def _renorm01(vec: Dict[str, float]) -> Dict[str, float]:
    for k in EMOTION_KEYS:
        vec[k] = max(0.0, float(vec.get(k, 0.0)))
    total = sum(vec[k] for k in EMOTION_KEYS if k != "中立")
    if total <= 0:
        out = {k: 0.0 for k in EMOTION_KEYS}
        out["中立"] = 1.0
        return out
    for k in EMOTION_KEYS:
        if k != "中立":
            vec[k] = vec[k] / total
    s = sum(vec[k] for k in EMOTION_KEYS if k != "中立")
    vec["中立"] = max(0.0, 1.0 - s)
    return vec

def blend_labels_ema_with_latest_bonus(prev: Dict[str, float] | None,
                                       latest: Dict[str, float]) -> Dict[str, float]:
    try:
        alpha = float(os.getenv("NOLOOK_EMA_ALPHA", "0.8"))
    except Exception:
        alpha = 0.8
    try:
        bonus = float(os.getenv("NOLOOK_LATEST_BONUS", "0.2"))
    except Exception:
        bonus = 0.2

    prev = _ensure_vec_keys(prev or {})
    latest = _renorm01(_ensure_vec_keys(latest))

    blended = {k: 0.0 for k in EMOTION_KEYS}
    for k in EMOTION_KEYS:
        if k == "中立":
            continue
        blended[k] = alpha * prev.get(k, 0.0) + (1 - alpha) * latest.get(k, 0.0)

    blended = _renorm01(blended)

    winner = max((k for k in EMOTION_KEYS if k != "中立"),
                 key=lambda x: latest.get(x, 0.0))
    blended[winner] = min(1.0, blended[winner] + max(0.0, bonus))
    blended = _renorm01(blended)
    return blended

# ===== ここから: LLM を使った感情分析 =====

_client: OpenAI | None = None

def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client

LLM_SYSTEM_PROMPT = """
あなたは日本の中高生の文章から感情を分析する専門AIです。
次の文章を読み、主要な感情を一つだけ選び、強さを0〜1で出してください。

感情は必ず次の中から選んでください：
[楽しい, 悲しい, 怒り, 不安, しんどい, 中立]

出力は必ず次のJSON形式のみとします：
{
  "emotion": "楽しい/悲しい/怒り/不安/しんどい/中立 のいずれか",
  "intensity": 0.0〜1.0 の数値
}
余計な文章は書かないでください。
"""

def _analyze_with_llm(text: str) -> Dict[str, float]:
    client = _get_client()
    res = client.chat.completions.create(
        model=os.getenv("NOLOOK_OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": LLM_SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        temperature=0.0,
    )
    content = res.choices[0].message.content
    data = json.loads(content)  # ここで失敗したら上でキャッチする

    emo = data.get("emotion", "中立")
    intensity = float(data.get("intensity", 0.7))

    if emo not in EMOTION_KEYS:
        emo = "中立"

    vec = _base_vec()
    vec[emo] = max(0.0, min(1.0, intensity))
    return _renorm01(vec)

def analyze_text_to_labels(text: str) -> Dict[str, float]:
    """
    メインの感情分析関数。
    原則LLMで解析し、失敗した場合は旧ルールベースにフォールバックする。
    """
    t = text.strip()
    if not t:
        vec = _base_vec()
        vec["中立"] = 1.0
        return vec

    try:
        return _analyze_with_llm(t)
    except Exception:
        # ログを出すならここで
        return _fallback_rule_analyze(t)

def one_hot_from_selected(norm: str) -> Dict[str, float]:
    vec = _base_vec()
    if norm in vec:
        vec[norm] = 1.0
    else:
        vec["中立"] = 1.0
    return vec
