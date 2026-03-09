// lib/nolookApi.ts
import {
  AnalyzeTextRequest,
  AnalyzeTextResponse,
} from "../types/backend";

// --- 重要ポイント ---
// ブラウザから Firebase へ直接アクセスすると CORS で落ちるため、
// Next.js の API ルート /api/fb-analyze に送る方式に統一する。
// ---------------------

// フロントが叩くのは常にこれだけ
const API_PATH = "/api/fb-analyze";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

// ------------------------------
// 感情解析 API のフロントエンド側
// ------------------------------
export async function analyzeText(
  payload: AnalyzeTextRequest
): Promise<AnalyzeTextResponse> {
  console.log("[nolookApi] POST ->", API_PATH);

  try {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await handleResponse<AnalyzeTextResponse>(res);

  } catch (e: any) {
    console.error("[nolookApi] fetch error:", e);
    throw new Error(`Failed to fetch (${API_PATH}): ${e?.message ?? e}`);
  }
}
