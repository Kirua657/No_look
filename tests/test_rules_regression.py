import os
import pytest

# ---- ここから: make_client をローカル定義（tests.utils が無い環境向け）----
try:
    # もし将来 tests.utils を用意したらこちらが使われる
    from tests.utils import make_client  # type: ignore
except ModuleNotFoundError:
    from importlib import import_module
    from fastapi.testclient import TestClient

    def make_client(tmp_path=None):
        mod = import_module("app.main")      # app.main から FastAPI app を取る
        app = getattr(mod, "app")
        c = TestClient(app)
        # APIキーが必要な実装を想定してデフォルトヘッダを付与
        c.headers.update({"X-API-Key": os.getenv("API_KEY", "dev-key")})
        return None, c
# ---- ここまで ----

# LLMの影響を完全カット（辞書ルールの回帰チェック用）
@pytest.fixture(autouse=True)
def _force_rule_only_env(monkeypatch):
    monkeypatch.setenv("NOLOOK_LLM_WEIGHT", "0")
    monkeypatch.setenv("NOLOOK_MANUAL_ONLY", "0")

CASES = [
    # 楽しい
    ("今日は自己ベスト更新！最高に気分がいい", "楽しい"),
    ("テスト合格した！めっちゃうれしい！", "楽しい"),
    ("優勝できてみんなで笑った", "楽しい"),
    ("部活で褒められてテンション上がった", "楽しい"),
    ("推しが新曲出して元気出た", "楽しい"),

    # 悲しい
    ("今日は失敗ばかりで落ち込んだ", "悲しい"),
    ("友だちと喧嘩して泣きたい", "悲しい"),
    ("頑張ったのに結果が出なくてつらい", "悲しい"),
    ("部活の試合に出られなくてショック", "悲しい"),

    # 怒り
    ("理不尽すぎてマジでムカつく", "怒り"),
    ("また約束破られて本当に腹が立つ", "怒り"),
    ("先生の言い方が刺さってイラッとした", "怒り"),
    ("ネットで心ないこと言われてキレそう", "怒り"),

    # 不安
    ("明日の面接が不安で眠れない", "不安"),
    ("テスト範囲が広すぎて心配", "不安"),
    ("この先どうなるかずっとそわそわする", "不安"),
    ("チームメンバーと上手くやれるか不安だ", "不安"),

    # しんどい
    ("もうヘトヘトで何もしたくない", "しんどい"),
    ("頭が回らなくてしんどい", "しんどい"),
    ("課題が溜まりすぎてキャパオーバー", "しんどい"),
    ("体が重くてだるい一日だった", "しんどい"),

    # 中立
    ("今日は部活。特に大きな出来事はなし", "中立"),
    ("明日は模試。午後から図書館行く", "中立"),
    ("雨だったから屋内で練習した", "中立"),
    ("朝は眠かったけど今は普通", "中立"),

    # エッジケース
    ("ムカつくとかじゃなくて、まあ大丈夫", "中立"),
    ("全然うれしくない結果で複雑", "悲しい"),
    ("しんどいと思ったけど意外と平気だった", "中立"),
    ("不安ではないと言い聞かせてる", "不安"),
]

@pytest.mark.parametrize("text,expected", CASES)
def test_rule_regressions(text, expected):
    _, c = make_client()
    r = c.post("/analyze", json={"prompt": text})
    assert r.status_code == 200, r.text
    js = r.json()
    assert js["emotion"] == expected
    for k in ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"):
        assert k in js["labels"]
