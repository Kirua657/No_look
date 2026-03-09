#!/usr/bin/env python
"""Emotion test runner + DB inspector for 6-class classifier."""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List

from emotion_rules import detect_emotion_6  # reuse production logic

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_CASES = BASE_DIR / "emotion_test_cases.json"
DB_PATH = BASE_DIR / "emotion_logs.db"


def load_cases(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Test case file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Test case file must contain a JSON array")
    return data


def run_cases(cases: List[Dict[str, Any]]) -> None:
    totals = Counter()
    corrects = Counter()
    conf_accumulator = defaultdict(list)
    mistakes: List[Dict[str, Any]] = []

    for idx, case in enumerate(cases, 1):
        text = (case.get("text") or "").strip()
        expected = case.get("expected")
        prev = case.get("prev_emotion")

        if not expected:
            raise ValueError(f"Case#{idx} is missing 'expected': {case}")

        pred, conf = detect_emotion_6(text, prev)
        totals[expected] += 1
        conf_accumulator[expected].append(conf)

        if pred == expected:
            corrects[expected] += 1
        else:
            mistakes.append(
                {
                    "index": idx,
                    "text": text,
                    "expected": expected,
                    "predicted": pred,
                    "confidence": conf,
                    "prev_emotion": prev,
                }
            )

    total_cases = sum(totals.values())
    total_correct = sum(corrects.values())
    overall_acc = (total_correct / total_cases * 100) if total_cases else 0.0

    print("\n" + "=" * 80)
    print("📊 Emotion Classifier Test Results")
    print("=" * 80)
    print(f"Total cases   : {total_cases}")
    print(f"Correct cases : {total_correct}")
    print(f"Accuracy      : {overall_acc:.1f}%")

    print("\n--- Per-label stats ------------------------------")
    labels = ["楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"]
    for label in labels:
        total = totals[label]
        correct = corrects[label]
        acc = (correct / total * 100) if total else 0.0
        avg_conf = sum(conf_accumulator[label]) / len(conf_accumulator[label]) if conf_accumulator[label] else 0.0
        print(
            f"{label: <5}: total={total: >3}  correct={correct: >3}  acc={acc:5.1f}%  avg_conf={avg_conf:4.2f}"
        )

    if mistakes:
        print("\n--- Mistakes (sorted by case index) --------------")
        for m in mistakes:
            print(
                f"#{m['index']:02d} expected={m['expected']} -> predicted={m['predicted']} (conf={m['confidence']:.2f}, prev={m['prev_emotion']})"
            )
            print(f"   text: {m['text']}")
    else:
        print("\n✅ No misclassifications! Great job.")


def inspect_db(limit: int) -> None:
    if not DB_PATH.exists():
        print(f"DB file not found: {DB_PATH}")
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        SELECT id, student_id, emotion, confidence, labels, created_at
        FROM emotion_logs
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = c.fetchall()
    conn.close()

    print("\n" + "=" * 80)
    print("🗄️ Latest emotion_logs snapshot")
    print("=" * 80)
    for r in rows:
        labels = json.loads(r[4]) if r[4] else {}
        print(f"ID: {r[0]} | student={r[1]} | emotion={r[2]} | conf={r[3]:.2f} | created={r[5]}")
        print(f"  labels={labels}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run emotion classifier regression tests.")
    parser.add_argument(
        "--cases",
        type=Path,
        default=DEFAULT_CASES,
        help="Path to JSON file containing test cases.",
    )
    parser.add_argument(
        "--inspect-db",
        action="store_true",
        help="Also print latest emotion_logs entries for manual inspection.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=20,
        help="Number of DB rows to show when --inspect-db is set.",
    )
    args = parser.parse_args()

    cases_path = args.cases if isinstance(args.cases, Path) else Path(args.cases)
    run_cases(load_cases(cases_path))

    if args.inspect_db:
        inspect_db(args.limit)


if __name__ == "__main__":
    main()
