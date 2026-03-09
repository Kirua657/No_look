# Firebase Backend Toolkit

## Emotion classifier regression tests

```
powershell
cd firebase_backend
python check_emotion_mix.py          # run against default emotion_test_cases.json
python check_emotion_mix.py --cases custom_cases.json
python check_emotion_mix.py --inspect-db --limit 10
```

- `emotion_test_cases.json` ships with 31 starter phrases covering全6分類 + 否定パターン。
- JSON schema: `{ "text": "…", "expected": "しんどい", "prev_emotion": "不安" }`. `prev_emotion` is optional.
- テスト結果では総合精度に加えて、ラベル別の件数・正答率・平均confidence、失敗例が一覧表示されます。
- `--inspect-db` を付けると、従来の `emotion_logs` スナップショットも確認できます。

## 推奨ワークフロー

1. **ケースを増やす**: 漏れているスラングや否定表現を見つけたら JSON に追加。
2. **ルール調整**: `emotion_rules.py` 内のパターンやスコアを編集したら、すぐに `python check_emotion_mix.py` を実行してリグレッション確認。
3. **信頼度連携**: 0.4 以下など自信の低いケースは LLM 併用を検討（将来タスク）。
4. **会話トーン改善**: `nolook_front/lib/No_look/app/routes/analyze.py` のプロンプトを微修正し、`history`/`last_reply` を活用して質問頻度や引用ルールを継続的に調整。

テストの数字が土台になるので、ルール強化やLLM混合を試すたびにこのスクリプトを回して精度の変化を記録してください。
