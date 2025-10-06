# app/services/analyze_service.py
from __future__ import annotations
import os
import re
from typing import Dict

EMOTION_KEYS = ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立")

# 単語重み（弱:1.0 / 中:1.5 / 強:2.0 くらい）
WORD_WEIGHTS = {
    "楽しい": {
        r"(楽しい|嬉し|うれし|最高|自己ベスト|優勝|合格|盛れた|神った)": 1.8,
        r"(よかった|助かった|順調|ワクワク|楽しみ|期待してる|期待している)": 1.3,
        r"(自信|自信ある|自信あり|自信がある)": 1.4,  # 自信はポジ寄り
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
        r"(でも|けど|ただ|かも)": 0.6,  # 逆接・不確実語の不安加点を弱める
    },
    "しんどい": {
        r"(しんど|つら|きつ|だる|疲れ|つかれ|眠い|頭痛|体調悪)": 1.8,
        r"(限界|もう無理|休みたい)": 2.0,
    },
}

# 否定・反転（“嬉しくない”→ポジ減/ネガ増）
NEGATIONS = (r"ない", r"じゃない", r"なく", r"ません", r"できない", r"無理")

# 記号・感嘆ブースト
EXCLA_BOOST = 1.15   # “！”があると感情全体を少し強める
REPEAT_BOOST = 1.10  # 連長音/同語繰り返しに微加点（例: つらーーい/ムカつくうう）

# 中立化しきい値（max がこの値未満なら中立に落とす）
NEUTRAL_FLOOR = 0.45

# “中立落ち”しにくくするため、最大ラベルに微ボーナス
WINNER_BONUS = 0.05


def _base_vec() -> Dict[str, float]:
    return {k: 0.0 for k in EMOTION_KEYS}


def analyze_text_to_labels(text: str) -> Dict[str, float]:
    t = text.strip()
    vec = _base_vec()

    # 単語重み加算
    for emo, patterns in WORD_WEIGHTS.items():
        for pat, w in patterns.items():
            for m in re.finditer(pat, t):
                vec[emo] += w

                # 直後5文字内に否定があれば反転（簡易）
                tail = t[m.end(): m.end() + 5]
                if any(ng in tail for ng in NEGATIONS):
                    if emo == "楽しい":
                        vec["悲しい"] += w * 0.7
                        vec["不安"] += w * 0.5
                        vec[emo] -= w * 0.8
                    else:
                        # ネガ系の否定は中立/楽しいへ分散
                        vec["楽しい"] += w * 0.4
                        vec["中立"] += w * 0.3
                        vec[emo] -= w * 0.6

    # 感嘆/繰り返しブースト
    if "！" in t or "!" in t:
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= EXCLA_BOOST
    # 非捕捉グループで安全化：長音「ー」連続 or 同一文字3連以上
    if re.search(r"(?:ー{2,}|(.)\1{2,})", t):
        for k in EMOTION_KEYS:
            if k != "中立":
                vec[k] *= REPEAT_BOOST

    # スコアの正規化（0..1）
    total = sum(v for k, v in vec.items() if k != "中立")
    if total <= 0:
        # 何もヒットしない → 中立
        vec = _base_vec()
        vec["中立"] = 1.0
        return vec

    for k in EMOTION_KEYS:
        if k != "中立":
            vec[k] = vec[k] / total

    # 調整：自信ワード＋軽い逆接なら不安をやや減衰
    if re.search(r"自信", t):
        if re.search(r"(でも|けど|ただ|かも)", t) and vec.get("不安", 0.0) > 0:
            vec["不安"] *= 0.7  # 30% 減衰

    # 中立判定（最大が弱ければ中立）
    max_label = max((k for k in EMOTION_KEYS if k != "中立"), key=lambda x: vec[x])
    max_val = vec[max_label]

    if max_val < NEUTRAL_FLOOR:
        out = _base_vec()
        out["中立"] = 1.0
        return out

    # 勝者ボーナス（わずかに押し上げて中立落ち回避）
    vec[max_label] = min(1.0, vec[max_label] + WINNER_BONUS)

    # 中立は 1 - sum(他) で埋める（下限0）
    s = sum(vec[k] for k in EMOTION_KEYS if k != "中立")
    vec["中立"] = max(0.0, 1.0 - s)

    return vec


def one_hot_from_selected(norm: str) -> Dict[str, float]:
    vec = _base_vec()
    vec[norm] = 1.0
    return vec


# --- ここから：EMA + 最新ボーナスのブレンド ---
def _ensure_vec_keys(vec: Dict[str, float] | None) -> Dict[str, float]:
    """EMOTION_KEYS をすべて持つ辞書に揃える（欠損は0.0）。"""
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
    """中立以外を合計1に正規化し、中立は 1-sum(他)。"""
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
    """
    直近推定(latest)を前回(prev)と指数移動平均でブレンドし、
    さらに latest の最大ラベルにボーナスを与える。
    - NOLOOK_EMA_ALPHA: 既定0.8（過去をどれだけ残すか）
    - NOLOOK_LATEST_BONUS: 既定0.2（最新勝者に加点して中立落ちを防ぐ）
    """
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

    # 中立以外をEMAでブレンド
    blended = {k: 0.0 for k in EMOTION_KEYS}
    for k in EMOTION_KEYS:
        if k == "中立":
            continue
        blended[k] = alpha * prev.get(k, 0.0) + (1 - alpha) * latest.get(k, 0.0)

    blended = _renorm01(blended)

    # 最新の勝者にボーナス（中立以外から勝者を決める）
    winner = max((k for k in EMOTION_KEYS if k != "中立"), key=lambda x: latest.get(x, 0.0))
    blended[winner] = min(1.0, blended[winner] + max(0.0, bonus))
    blended = _renorm01(blended)
    return blended
# --- ここまで ---
