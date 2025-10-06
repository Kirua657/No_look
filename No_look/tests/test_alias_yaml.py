# tests/test_alias_yaml.py
import importlib

def test_alias_yaml_loaded():
    mod = importlib.import_module("genai.main")
    alias_map = getattr(mod, "ALIAS_MAP", {})
    # 代表キーが最低限そろっていること
    for key in ("楽しい", "悲しい", "怒り", "不安", "しんどい", "中立"):
        assert key in alias_map
