# app/services/analyze_service.py
from __future__ import annotations
import os
import re
from typing import Dict

EMOTION_KEYS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

# 単語重み（弱:1.0 / 中:1.5 / 強:2.0 くらい）
WORD_WEIGHTS = {
    "楽しい": {
        r"(楽しい|嬉し|うれし|最高|自己ベスト|優勝|合格|盛れた|神った)": 1.9,
        r"(よかった|助かった|順調|ワクワク|楽しみ|期待してる|期待している|嬉しかった)": 1.35,
        r"(自信(がある|あり|ある|持ってる)?)": 1.4,
    },
    "悲しい": {
        r"(悲し|かなしい|落ち込|萎え|萎えた|泣きたい|ショック|へこむ|悔し(い|かった)?)": 1.9,
        r"(失敗|ミス|うまくいかない|つらい|報われない|空しい)": 1.35,
    },
    "怒り": {
        r"(イライラ|いらいら|ムカつ|むかつ|イラつ|腹立|許せない|キレそう|納得いかない|責められ|責められて|理不尽|不公平)": 2.0,
        r"(雑|舐めてる|なめてる|雑に|ふざけんな|バカにされ)": 1.5,
    },
    "不安": {
        r"(不安|心配|焦る|焦っ|緊張|プレッシャ|間に合わない|大丈夫かな|不確か|自信がない)": 1.9,
        r"(でも|けど|ただ|かも|かもしれない|気がする)": 0.65,
    },
    "しんどい": {
        r"(しんど|つら|きつ|だる|疲れ|つかれ|眠い|頭痛|体調悪|具合悪|吐き気)": 1.9,
        r"(限界|もう無理|休みたい|寝たい|倒れそう)": 2.1,
    },
}

# 否定・反転（前後どちらにあっても拾う）
NEGATIONS = (r"ない", r"じゃない", r"なく", r"ません", r"できない", r"無理", r"じゃなかった", r"なかった")

# ブースト類
EXCLA_BOOST = 1.15   # “！”があると感情全体を少し強める
REPEAT_BOOST = 1.10  # 連長音/同語繰り返しに微加点

# 閾値（中立落ちを抑え気味に）
NEUTRAL_FLOOR = 0.40
WINNER_BONUS  = 0.06

# “強い怒り”の早期確定語
ANGER_EARLY_RETURN = ("イライラ", "いらいら", "責められ", "責められて", "ふざけんな")

def _base_vec() -> Dict[str, float]:
    return {k: 0.0 for k in EMOTION_KEYS}

def analyze_text_to_labels(text: str) -> Dict[str, float]:
    t = text.strip()
    vec = _base_vec()

    # --- 怒りのハードヒット（先に確定して戻る）---
    if any(h in t for h in ANGER_EARLY_RETURN):
        vec["怒り"] = 1.0
        vec["中立"] = 0.0
        return vec

    # 単語重み加算（前後6文字で簡易否定）-------------------------------
    for emo, patterns in WORD_WEIGHTS.items():
        for pat, w in patterns.items():
            for m in re.finditer(pat, t):
                vec[emo] += w
                # 前後6文字に否定語があれば反転
                head = t[max(0, m.start()-6): m.start()]
                tail = t[m.end(): m.end()+6]
                neg_around = any(ng in head or ng in tail for ng in NEGATIONS)
                if neg_around:
                    if emo == "楽しい":
                        vec["悲しい"] += w * 0.8
                        vec["不安"]   += w * 0.6
                        vec[emo]      -= w * 0.9
                    else:
                        vec["楽しい"] += w * 0.45
                        vec["中立"]   += w * 0.35
                        vec[emo]      -= w * 0.65

    # 感嘆/繰り返しブースト -------------------------------------------
    if "！" in t or "!" in t:
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= EXCLA_BOOST
    if re.search(r"(?:ー{2,}|(.)\1{2,})", t):
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= REPEAT_BOOST

    # 正規化 ---------------------------------------------------------
    total = sum(v for k, v in vec.items() if k != "中立")
    if total <= 0:
        vec = _base_vec()
        vec["中立"] = 1.0
        return vec
    for k in EMOTION_KEYS:
        if k != "中立":
            vec[k] = vec[k] / total

    # 自信×逆接で不安を少し減衰
    if re.search(r"自信", t) and re.search(r"(でも|けど|ただ|かも|かもしれない)", t):
        if vec.get("不安", 0.0) > 0:
            vec["不安"] *= 0.7

    # 中立判定 & 勝者ボーナス ---------------------------------------
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

# one-hot / EMA ブレンド（据え置き）
def one_hot_from_selected(norm: str) -> Dict[str, float]:
    vec = _base_vec()
    vec[norm] = 1.0
    return vec

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
    winner = max((k for k in EMOTION_KEYS if k != "中立"), key=lambda x: latest.get(x, 0.0))
    blended[winner] = min(1.0, blended[winner] + max(0.0, bonus))
    blended = _renorm01(blended)
    return blended
