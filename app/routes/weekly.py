from fastapi import APIRouter, Query

router = APIRouter()

@router.get("", summary="週間レポート（ダミー）")
def weekly_report(week_of: str = Query(..., description="週の開始日(YYYY-MM-DD)")):
    return {"week_of": week_of, "highlights": [], "notes": "ここに週報サマリー"}
