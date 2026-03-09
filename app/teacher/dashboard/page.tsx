"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EmotionStat {
  emotion: string;
  count: number;
  avg_confidence: number;
}

interface WeeklyData {
  stats: EmotionStat[];
  total_messages: number;
  days: number;
}

interface BreakdownData {
  emotion_stats: Array<{
    emotion: string;
    count: number;
    unique_students: number;
    avg_confidence: number;
  }>;
  daily_breakdown: Array<{
    emotion: string;
    daily_count: number;
    date: string;
  }>;
}

const EMOTION_COLORS = {
  happy: "#FFD700",
  sad: "#4169E1",
  angry: "#FF4500",
  anxious: "#FF69B4",
  tired: "#8B4513",
  neutral: "#808080",
};

const EMOTION_LABELS = {
  happy: "嬉しい",
  sad: "悲しい",
  angry: "怒り",
  anxious: "不安",
  tired: "疲労",
  neutral: "中立",
};

export default function TeacherDashboard() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [breakdownData, setBreakdownData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 週間統計を取得（Next.js API ルート経由）
        const weeklyRes = await fetch(`/api/stats?endpoint=weekly&days=${days}`);
        if (!weeklyRes.ok) throw new Error("週間統計の取得に失敗しました");
        const weeklyJson = await weeklyRes.json();
        setWeeklyData(weeklyJson.data);

        // 詳細統計を取得（Next.js API ルート経由）
        const breakdownRes = await fetch(`/api/stats?endpoint=emotion-breakdown&days=${days}`);
        if (!breakdownRes.ok) throw new Error("詳細統計の取得に失敗しました");
        const breakdownJson = await breakdownRes.json();
        setBreakdownData(breakdownJson.data);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days]);

  // グラフ用データに変換
  const barChartData = weeklyData?.stats.map((stat) => ({
    name: EMOTION_LABELS[stat.emotion as keyof typeof EMOTION_LABELS] || stat.emotion,
    count: stat.count,
    emotion: stat.emotion,
  })) || [];

  const pieChartData = barChartData.map((item) => ({
    name: item.name,
    value: item.count,
    emotion: item.emotion,
  }));

  // 心配な生徒リスト（不安・疲労が多い）
  const concernedStudents = breakdownData?.emotion_stats
    .filter((stat) => ["anxious", "tired"].includes(stat.emotion))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "20px" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
          先生ダッシュボード
        </h1>
        <p style={{ color: "#666", marginBottom: "16px" }}>
          生徒たちの感情分析を一目で確認できます
        </p>

        {/* 日数選択 */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: "8px 16px",
                background: days === d ? "#007bff" : "#ddd",
                color: days === d ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: days === d ? "bold" : "normal",
              }}
            >
              {d}日
            </button>
          ))}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #fcc",
            color: "#c33",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ローディング状態 */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
          読み込み中...
        </div>
      )}

      {!loading && (
        <>
          {/* 統計概要 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
              <p style={{ color: "#999", fontSize: "12px", marginBottom: "8px" }}>総メッセージ数</p>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                {weeklyData?.total_messages || 0}
              </p>
            </div>

            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
              <p style={{ color: "#999", fontSize: "12px", marginBottom: "8px" }}>感情の種類</p>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                {weeklyData?.stats.length || 0}
              </p>
            </div>

            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
              <p style={{ color: "#999", fontSize: "12px", marginBottom: "8px" }}>期間</p>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
                {days}日
              </p>
            </div>
          </div>

          {/* グラフセクション */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            {/* 棒グラフ */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>感情別メッセージ数</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || "#8884d8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 円グラフ */}
            <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>感情の割合</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || "#8884d8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 不安・疲労の多い生徒リスト */}
          <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 3px #0001" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px" }}>
              ⚠️ 不安・疲労が多い感情
            </h2>
            {breakdownData?.emotion_stats
              .filter((stat) => ["anxious", "tired"].includes(stat.emotion))
              .sort((a, b) => b.count - a.count)
              .map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    borderBottom: idx < breakdownData.emotion_stats.filter((s) => ["anxious", "tired"].includes(s.emotion)).length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                      {EMOTION_LABELS[stat.emotion as keyof typeof EMOTION_LABELS] || stat.emotion}
                    </span>
                    <span style={{ color: "#999", fontSize: "12px", marginLeft: "8px" }}>
                      （{stat.unique_students}人の生徒）
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "18px", color: EMOTION_COLORS[stat.emotion as keyof typeof EMOTION_COLORS] }}>
                      {stat.count}
                    </span>
                    <span style={{ color: "#999", fontSize: "12px" }}>
                      信頼度: {(stat.avg_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* ナビゲーション */}
          <div style={{ marginTop: "30px", display: "flex", gap: "8px" }}>
            <Link href="/teacher">
              <button
                style={{
                  padding: "12px 24px",
                  background: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ← 戻る
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
