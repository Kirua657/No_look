from app.models.schemas import AnalyzeInput, AnalysisResult, Labels, Emotion

def test_analyze_input_model():
    m = AnalyzeInput(text="テスト", class_id="1-A", topic_hint=["部活"])
    assert m.text == "テスト"
    assert m.class_id == "1-A"

def test_analysis_result_model():
    labels = Labels(楽しい=0.1, 悲しい=0.2, 怒り=0.1, 不安=0.2, しんどい=0.1, 中立=0.3)
    r = AnalysisResult(emotion=Emotion.neutral, score=0.9, labels=labels)
    assert r.emotion.value == "中立"
    assert 0.0 <= r.score <= 1.0
