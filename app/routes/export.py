# app/routes/export.py
from __future__ import annotations
from datetime import timezone, datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Query, Response
from sqlalchemy import select, desc, and_
from app.core.db import session_scope, init_db
from app.models.orm import EmotionLog

import io
import json
try:
    from openpyxl import Workbook
except Exception:
    Workbook = None  # openpyxl 未インストール時でも import エラーで落ちないように

router = APIRouter(prefix="/export", tags=["export"])
_initialized = False

def _row_to_dict(
    created_at, id, class_id, student_id, emotion, score, labels,
    topic_tags, relationship_mention, negation_index, avoidance
) -> Dict[str, Any]:
    created = created_at
    if isinstance(created, datetime) and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    return {
        "id": id,
        "created_at": created.isoformat() if isinstance(created, datetime) else str(created),
        "class_id": class_id,
        "student_id": student_id,
        "emotion": emotion,
        "score": score,
        "labels": labels,
        "topic_tags": topic_tags,
        "relationship_mention": relationship_mention,
        "negation_index": negation_index,
        "avoidance": avoidance,
    }

@router.get("", summary="ログをエクスポート（?format=json|xlsx）")
def export_logs(
    format: str = Query("json", pattern="^(json|xlsx)$"),
    class_id: Optional[str] = Query(None),
    limit: int = Query(1000, ge=1, le=100000),
):
    global _initialized
    if not _initialized:
        init_db()
        _initialized = True

    where = []
    if class_id:
        where.append(EmotionLog.class_id == class_id)

    # セッション内で必要カラムを取り切る
    with session_scope() as s:
        stmt = (
            select(
                EmotionLog.created_at, EmotionLog.id, EmotionLog.class_id, EmotionLog.student_id,
                EmotionLog.emotion, EmotionLog.score, EmotionLog.labels, EmotionLog.topic_tags,
                EmotionLog.relationship_mention, EmotionLog.negation_index, EmotionLog.avoidance
            )
            .where(and_(*where) if where else True)
            .order_by(desc(EmotionLog.created_at))
            .limit(limit)
        )
        rows = s.execute(stmt).all()
        items = [_row_to_dict(*row) for row in rows]

    if format == "json":
        return items

    # ---- XLSX を生成 ----
    # openpyxl が無ければタブ区切りを XLSX MIME で返していた従来互換
    if Workbook is None:
        header = [
            "id", "created_at", "class_id", "student_id", "emotion", "score",
            "labels", "topic_tags", "relationship_mention", "negation_index", "avoidance",
        ]
        lines = ["\t".join(header)]
        for it in items:
            line = "\t".join([
                str(it.get("id", "")),
                str(it.get("created_at", "")),
                str(it.get("class_id", "")) if it.get("class_id") is not None else "",
                str(it.get("student_id", "")) if it.get("student_id") is not None else "",
                str(it.get("emotion", "")),
                str(it.get("score", "")),
                json.dumps(it.get("labels", ""), ensure_ascii=False),
                json.dumps(it.get("topic_tags", ""), ensure_ascii=False),
                str(it.get("relationship_mention", "")),
                str(it.get("negation_index", "")),
                str(it.get("avoidance", "")),
            ])
            lines.append(line)
        content_bytes = ("\r\n".join(lines)).encode("utf-8-sig")
        headers = {"Content-Disposition": 'attachment; filename="emotion_logs.xlsx"'}
        return Response(
            content=content_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers,
        )

    # openpyxl で本物の .xlsx を作成
    wb = Workbook()
    ws = wb.active
    ws.title = "emotion_logs"

    header = [
        "id", "created_at", "class_id", "student_id", "emotion", "score",
        "labels", "topic_tags", "relationship_mention", "negation_index", "avoidance",
    ]
    ws.append(header)

    def _cell(v):
        if isinstance(v, (dict, list)):
            return json.dumps(v, ensure_ascii=False)
        return v

    for it in items:
        ws.append([
            _cell(it.get("id")),
            _cell(it.get("created_at")),
            _cell(it.get("class_id")),
            _cell(it.get("student_id")),
            _cell(it.get("emotion")),
            _cell(it.get("score")),
            _cell(it.get("labels")),
            _cell(it.get("topic_tags")),
            _cell(it.get("relationship_mention")),
            _cell(it.get("negation_index")),
            _cell(it.get("avoidance")),
        ])

    bio = io.BytesIO()
    wb.save(bio)
    bio.seek(0)
    data = bio.getvalue()

    headers = {"Content-Disposition": 'attachment; filename="emotion_logs.xlsx"'}
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
