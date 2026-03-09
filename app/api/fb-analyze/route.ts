// app/api/fb-analyze/route.ts
import { NextRequest } from "next/server";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[fb-analyze] BACKEND_BASE:", BACKEND_BASE);
  console.log("[fb-analyze] request body:", body);

  const backendUrl = `${BACKEND_BASE}/api/analyze`;

  // ✅ 履歴対応: messages を転送する
  // ✅ 後方互換: text だけの場合も対応
  const payload: any = {
    student_id: body.student_id ?? body.user_id ?? "demo-student",
    class_id: body.class_id ?? "demo-class",
  };

  if (body.messages) {
    // 新形式: messages 配列を転送
    payload.messages = body.messages;
  } else if (body.text) {
    // 旧形式: text だけの場合は後方互換
    payload.text = body.text;
  }

  const backendRes = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await backendRes.text();
  console.log("[fb-analyze] backend status:", backendRes.status, "body:", text);

  if (!backendRes.ok) {
    // バックエンド側のエラーをそのまま返す
    return new Response(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 正常時はそのままフロントに返す
  return new Response(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
