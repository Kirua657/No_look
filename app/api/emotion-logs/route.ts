// app/api/emotion-logs/route.ts
// プロキシ: フロント → Next.js → Python Backend
import { NextRequest, NextResponse } from "next/server";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[emotion-logs API] 📥 Received request body:", JSON.stringify(body, null, 2));
    console.log("[emotion-logs API] 🔗 Forwarding to:", `${PYTHON_BACKEND_URL}/api/analyze`);

    // Python バックエンドの /api/analyze に転送
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("[emotion-logs API] 📤 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[emotion-logs API] ❌ Backend error:", response.status, errorText);
      // ★ エラーときはモック応答の代わりにエラーを返す
      return NextResponse.json(
        { 
          error: "Emotion analysis failed", 
          details: errorText,
          entry_id: "error",
          message: "backend error"
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[emotion-logs API] ✅ Success response:", JSON.stringify(data, null, 2));

    // ★ Python が返した JSON をそのまま返す（モックなし）
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[emotion-logs API] 💥 Exception:", error);
    // ★ 予期せぬエラーのみモック使用
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: String(error),
        entry_id: "exception",
        message: "exception occurred"
      },
      { status: 500 }
    );
  }
}
