"use client";
import DesktopFrame from "../../components/frame/DesktopFrame";
import React, { useState, useEffect } from "react";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: "重要" | "お知らせ" | "メンテナンス" | "アップデート";
  isNew: boolean;
}

interface EmotionData {
  id: number;
  emotion: string;
  yesterdayResult: number;
  todayResult: number;
  change: number;
  count: number;
}

interface EmotionAlert {
  id: number;
  emotion: string;
  change: number;
  severity: "high" | "medium" | "low";
  timestamp: string;
  description: string;
  isRead: boolean;
}

export default function Maker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [emotionLoading, setEmotionLoading] = useState(true);
  const [emotionError, setEmotionError] = useState<string | null>(null);
  
  const [emotionAlerts, setEmotionAlerts] = useState<EmotionAlert[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<EmotionAlert | null>(null);
  const [showAlertDetail, setShowAlertDetail] = useState(false);

  // JSONファイルからニュースデータを取得
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/news.json");
        
        if (!response.ok) {
          throw new Error("ニュースデータの取得に失敗しました");
        }
        
        const newsData: NewsItem[] = await response.json();
        
        // 日付でソート（新しい順）
        const sortedNews = newsData.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setNews(sortedNews);
        setError(null);
      } catch (err) {
        console.error("ニュース取得エラー:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // JSONファイルから感情データを取得
  useEffect(() => {
    const fetchEmotionData = async () => {
      try {
        setEmotionLoading(true);
        
        // 緊急感情感知のテストデータ
        const testEmotionData: EmotionData[] = [
          {
            id: 1,
            emotion: "怒り",
            yesterdayResult: 15,
            todayResult: 45,
            change: 30,
            count: 12
          },
          {
            id: 2,
            emotion: "悲しみ",
            yesterdayResult: 25,
            todayResult: 5,
            change: -20,
            count: 8
          },
          {
            id: 3,
            emotion: "不安",
            yesterdayResult: 20,
            todayResult: 55,
            change: 35,
            count: 15
          },
          {
            id: 4,
            emotion: "喜び",
            yesterdayResult: 60,
            todayResult: 25,
            change: -35,
            count: 10
          },
          {
            id: 5,
            emotion: "驚き",
            yesterdayResult: 10,
            todayResult: 30,
            change: 20,
            count: 6
          },
          {
            id: 6,
            emotion: "恐怖",
            yesterdayResult: 8,
            todayResult: 25,
            change: 17,
            count: 5
          },
          {
            id: 7,
            emotion: "嫌悪",
            yesterdayResult: 12,
            todayResult: 18,
            change: 6,
            count: 3
          },
          {
            id: 8,
            emotion: "信頼",
            yesterdayResult: 45,
            todayResult: 50,
            change: 5,
            count: 18
          }
        ];

        setEmotionData(testEmotionData);
        setEmotionError(null);
        
        // 感情急激変化通知を生成
        const alerts = generateEmotionAlerts(testEmotionData);
        setEmotionAlerts(alerts);
      } catch (err) {
        console.error("感情データ取得エラー:", err);
        setEmotionError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setEmotionLoading(false);
      }
    };

    fetchEmotionData();
  }, []);

  // 感情急激変化を検出して通知を生成
  const generateEmotionAlerts = (data: EmotionData[]): EmotionAlert[] => {
    const alerts: EmotionAlert[] = [];
    
    data.forEach(emotion => {
      const changePercent = Math.abs(emotion.change);
      
      // 10%以上の変化がある場合に通知を生成
      if (changePercent >= 10) {
        const severity: "high" | "medium" | "low" = 
          changePercent >= 30 ? "high" :
          changePercent >= 20 ? "medium" : "low";
        
        const changeDirection = emotion.change > 0 ? "上昇" : "下降";
        
        alerts.push({
          id: emotion.id,
          emotion: emotion.emotion,
          change: emotion.change,
          severity,
          timestamp: new Date().toISOString(),
          description: `${emotion.emotion}が${Math.abs(emotion.change)}%${changeDirection}しました。`,
          isRead: Math.random() > 0.7
        });
      }
    });
    
    // 重要度順、未読優先でソート
    return alerts.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  // 通知を既読にする
  const markAlertAsRead = (alertId: number) => {
    setEmotionAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  // 感情変化詳細を開く
  const openAlertDetail = (alert: EmotionAlert) => {
    setSelectedAlert(alert);
    setShowAlertDetail(true);
    markAlertAsRead(alert.id);
  };

  // 感情変化詳細を閉じる
  const closeAlertDetail = () => {
    setShowAlertDetail(false);
    setSelectedAlert(null);
  };

  // ニュース詳細を開く
  const openNewsDetail = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setShowNewsDetail(true);
  };

  // ニュース詳細を閉じる
  const closeNewsDetail = () => {
    setShowNewsDetail(false);
    setSelectedNews(null);
  };

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  };

  // カテゴリ別の色設定
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "重要": return { bg: "#dc2626", text: "#fff" };
      case "メンテナンス": return { bg: "#d97706", text: "#fff" };
      case "アップデート": return { bg: "#2563eb", text: "#fff" };
      case "お知らせ": return { bg: "#059669", text: "#fff" };
      default: return { bg: "#6b7280", text: "#fff" };
    }
  };

  // 重要度別のアイコンを取得
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return "🚨";
      case "medium": return "⚠️";
      case "low": return "📊";
      default: return "📊";
    }
  };

  return (
    <DesktopFrame>
      <div style={{ padding: "20px", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
        {/* ヘッダーセクション */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "24px", 
              fontWeight: "bold", 
              color: "#1f2937",
              margin: "0 0 4px 0"
            }}>
              管理者ダッシュボード
            </h1>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px",
              margin: "0 0 16px 0"
            }}>
              システム管理とお知らせの確認
            </p>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "500",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
          }}>
            {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* 学校情報セクション */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginBottom: "16px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)",
            color: "#ffffff",
            padding: "24px 24px",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "32px"
          }}>
            <span>東京都立○○高等学校</span>
            <span>2年A組</span>
            <span>数学科</span>
          </div>
        </div>

        {/* ニュースセクション */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginBottom: "16px"
        }}>
          {/* ニュースヘッダー */}
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            padding: "8px 12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>📢</span>
                <h2 style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  color: "#fff",
                  margin: 0
                }}>
                  最新ニュース
                </h2>
              </div>
              <div style={{
                background: "#dc2626",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "9px",
                fontWeight: "600"
              }}>
                {loading ? "-" : news.filter(item => item.isNew).length}
              </div>
            </div>
          </div>

          {/* ニュースリスト */}
          <div style={{ 
            maxHeight: showAllNews ? "400px" : "180px", 
            overflowY: "auto",
            transition: "max-height 0.3s ease"
          }}>
            {loading ? (
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                ニュースを読み込み中...
              </div>
            ) : error ? (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                color: "#dc2626" 
              }}>
                エラー: {error}
              </div>
            ) : (
              (showAllNews ? news : news.slice(0, 3)).map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px",
                    borderBottom: index < (showAllNews ? news.length - 1 : Math.min(news.length, 3) - 1) ? "1px solid #f3f4f6" : "none",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    position: "relative"
                  }}
                  onClick={() => openNewsDetail(item)}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    {/* NEW バッジ */}
                    {item.isNew && (
                      <span style={{
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "8px",
                        fontWeight: "bold",
                        padding: "1px 4px",
                        borderRadius: "4px",
                        marginTop: "2px",
                        flexShrink: 0
                      }}>
                        NEW
                      </span>
                    )}

                    {/* コンテンツ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        {/* カテゴリバッジ */}
                        <span style={{
                          background: getCategoryColor(item.category).bg,
                          color: getCategoryColor(item.category).text,
                          fontSize: "9px",
                          fontWeight: "600",
                          padding: "1px 5px",
                          borderRadius: "6px"
                        }}>
                          {item.category}
                        </span>

                        {/* 日付 */}
                        <span style={{
                          fontSize: "9px",
                          color: "#9ca3af"
                        }}>
                          {formatDate(item.date)}
                        </span>
                      </div>

                      {/* タイトル */}
                      <h3 style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#374151",
                        margin: "2px 0 4px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {item.title}
                      </h3>

                      {/* 内容 */}
                      <p style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.4",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                      } as React.CSSProperties}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* フッター */}
          {!loading && !error && news.length > 3 && (
            <div style={{
              padding: "8px 12px",
              background: "#f8fafc",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              {/* 件数表示 */}
              <span style={{
                fontSize: "10px",
                color: "#6b7280",
                fontWeight: "500"
              }}>
                {showAllNews ? `全${news.length}件` : `${news.length}件中3件表示`}
              </span>

              {/* 切り替えボタン */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowAllNews(!showAllNews);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  fontSize: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                {showAllNews ? "一部を表示" : "すべて表示"}
              </button>
            </div>
          )}
        </div>

        {/* 感情急激変化通知セクション */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginBottom: "16px"
        }}>
          {/* 通知ヘッダー */}
          <div style={{
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            padding: "8px 12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>🚨</span>
                <h2 style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  color: "#fff",
                  margin: 0
                }}>
                  感情急激変化通知
                </h2>
              </div>
              <div style={{
                background: "#fbbf24",
                color: "#92400e",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "9px",
                fontWeight: "600"
              }}>
                {emotionLoading ? "-" : emotionAlerts.filter(alert => !alert.isRead).length}
              </div>
            </div>
          </div>

          {/* 通知リスト */}
          <div style={{ 
            maxHeight: showAllAlerts ? "400px" : "200px", 
            overflowY: "auto",
            transition: "max-height 0.3s ease"
          }}>
            {emotionLoading ? (
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                感情データを読み込み中...
              </div>
            ) : emotionError ? (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                color: "#dc2626" 
              }}>
                エラー: {emotionError}
              </div>
            ) : emotionAlerts.length === 0 ? (
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                現在、急激な感情変化は検出されていません。
              </div>
            ) : (
              (showAllAlerts ? emotionAlerts : emotionAlerts.slice(0, 3)).map((alert, index) => (
                <div
                  key={alert.id}
                  style={{
                    padding: "12px",
                    borderBottom: index < (showAllAlerts ? emotionAlerts.length - 1 : Math.min(emotionAlerts.length, 3) - 1) ? "1px solid #f3f4f6" : "none",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    background: alert.isRead ? "transparent" : "#fef3c7",
                    position: "relative"
                  }}
                  onClick={() => openAlertDetail(alert)}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.background = alert.isRead ? "#f9fafb" : "#fef3c7";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.background = alert.isRead ? "transparent" : "#fef3c7";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    {/* 重要度アイコン */}
                    <span style={{
                      fontSize: "14px",
                      marginTop: "1px",
                      flexShrink: 0
                    }}>
                      {getSeverityIcon(alert.severity)}
                    </span>

                    {/* コンテンツ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <span style={{
                          background: alert.severity === "high" ? "#dc2626" : alert.severity === "medium" ? "#d97706" : "#059669",
                          color: "#fff",
                          fontSize: "9px",
                          fontWeight: "600",
                          padding: "1px 5px",
                          borderRadius: "6px"
                        }}>
                          {alert.severity === "high" ? "高" : alert.severity === "medium" ? "中" : "低"}
                        </span>

                        <span style={{
                          fontSize: "9px",
                          color: "#9ca3af"
                        }}>
                          {formatDate(alert.timestamp)}
                        </span>

                        {!alert.isRead && (
                          <span style={{
                            background: "#3b82f6",
                            color: "#fff",
                            fontSize: "8px",
                            fontWeight: "bold",
                            padding: "1px 4px",
                            borderRadius: "4px"
                          }}>
                            未読
                          </span>
                        )}
                      </div>

                      <h3 style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#374151",
                        margin: "2px 0 4px 0"
                      }}>
                        {alert.emotion} {alert.change > 0 ? "上昇" : "下降"}警告
                      </h3>

                      <p style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: "1.4"
                      }}>
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* フッター */}
          {!emotionLoading && !emotionError && emotionAlerts.length > 3 && (
            <div style={{
              padding: "8px 12px",
              background: "#f8fafc",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{
                fontSize: "10px",
                color: "#6b7280",
                fontWeight: "500"
              }}>
                {showAllAlerts ? `全${emotionAlerts.length}件` : `${emotionAlerts.length}件中3件表示`}
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowAllAlerts(!showAllAlerts);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  fontSize: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                {showAllAlerts ? "一部を表示" : "すべて表示"}
              </button>
            </div>
          )}
        </div>

        {/* 感情データ表 */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            padding: "8px 12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>📊</span>
              <h2 style={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                color: "#fff",
                margin: 0
              }}>
                感情分析データ
              </h2>
            </div>
          </div>

          <div style={{ 
            maxHeight: "400px", 
            overflowY: "auto" 
          }}>
            {emotionLoading ? (
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                感情データを読み込み中...
              </div>
            ) : emotionError ? (
              <div style={{ 
                padding: "20px", 
                textAlign: "center", 
                color: "#dc2626" 
              }}>
                エラー: {emotionError}
              </div>
            ) : (
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  <tr>
                    <th style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>感情</th>
                    <th style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>昨日</th>
                    <th style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>今日</th>
                    <th style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>変化</th>
                    <th style={{
                      padding: "8px 12px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>人数</th>
                  </tr>
                </thead>
                <tbody>
                  {emotionData.map((item, index) => (
                    <tr key={item.id} style={{
                      borderBottom: index < emotionData.length - 1 ? "1px solid #f3f4f6" : "none"
                    }}>
                      <td style={{
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151"
                      }}>{item.emotion}</td>
                      <td style={{
                        padding: "8px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#4b5563"
                      }}>{item.yesterdayResult}%</td>
                      <td style={{
                        padding: "8px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#4b5563"
                      }}>{item.todayResult}%</td>
                      <td style={{
                        padding: "8px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: item.change > 0 ? "#dc2626" : item.change < 0 ? "#2563eb" : "#4b5563",
                        fontWeight: Math.abs(item.change) >= 10 ? "600" : "normal"
                      }}>
                        {item.change > 0 ? "+" : ""}{item.change}%
                      </td>
                      <td style={{
                        padding: "8px 12px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#4b5563"
                      }}>
                        <span style={{
                          background: "#dbeafe",
                          color: "#1e40af",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          fontWeight: "500"
                        }}>
                          {item.count}名
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 感情変化詳細モーダル */}
        {showAlertDetail && selectedAlert && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }} onClick={closeAlertDetail}>
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative"
            }} onClick={e => e.stopPropagation()}>
              {/* モーダルヘッダー */}
              <div style={{
                background: (() => {
                  switch (selectedAlert.severity) {
                    case "high": return "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                    case "medium": return "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
                    case "low": return "linear-gradient(135deg, #059669 0%, #047857 100%)";
                    default: return "linear-gradient(135deg, #374151 0%, #1f2937 100%)";
                  }
                })(),
                padding: "20px 24px",
                color: "#fff",
                position: "relative"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>{getSeverityIcon(selectedAlert.severity)}</span>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" }}>
                        感情変化警告
                      </h2>
                      <p style={{ fontSize: "14px", margin: 0, opacity: 0.9 }}>
                        {selectedAlert.emotion}の急激な変化を検出
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeAlertDetail}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 学校情報セクション */}
              <div style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#475569"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>🏫</span>
                    <span>東京都立○○高等学校</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>👥</span>
                    <span>2年A組</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>📚</span>
                    <span>数学科</span>
                  </div>
                </div>
              </div>

              {/* モーダルコンテンツ */}
              <div style={{
                padding: "24px",
                maxHeight: "400px",
                overflowY: "auto"
              }}>
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                    変化の詳細
                  </h3>
                  <div style={{ 
                    background: "#f8fafc", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>感情:</span>
                      <span style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>{selectedAlert.emotion}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>変化量:</span>
                      <span style={{ 
                        fontSize: "16px", 
                        fontWeight: "600",
                        color: selectedAlert.change > 0 ? "#dc2626" : "#2563eb"
                      }}>
                        {selectedAlert.change > 0 ? "+" : ""}{selectedAlert.change}%
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>重要度:</span>
                      <span style={{
                        background: selectedAlert.severity === "high" ? "#dc2626" : selectedAlert.severity === "medium" ? "#d97706" : "#059669",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "6px"
                      }}>
                        {selectedAlert.severity === "high" ? "高" : selectedAlert.severity === "medium" ? "中" : "低"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", color: "#6b7280" }}>検出時刻:</span>
                      <span style={{ fontSize: "14px", color: "#1f2937" }}>{formatDate(selectedAlert.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                    推奨対応
                  </h3>
                  <div style={{ 
                    background: "#fef3c7", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #fde68a"
                  }}>
                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#92400e" }}>
                      <li style={{ marginBottom: "8px" }}>該当生徒との個別面談を検討してください</li>
                      <li style={{ marginBottom: "8px" }}>クラス全体の雰囲気を確認してください</li>
                      <li style={{ marginBottom: "8px" }}>必要に応じてカウンセラーとの連携を検討してください</li>
                      <li>継続的な観察を行ってください</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={closeAlertDetail}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ニュース詳細モーダル */}
        {showNewsDetail && selectedNews && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }} onClick={closeNewsDetail}>
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative"
            }} onClick={e => e.stopPropagation()}>
              {/* モーダルヘッダー */}
              <div style={{
                background: (() => {
                  switch (selectedNews.category) {
                    case "重要": return "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                    case "メンテナンス": return "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
                    case "アップデート": return "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)";
                    case "お知らせ": return "linear-gradient(135deg, #059669 0%, #047857 100%)";
                    default: return "linear-gradient(135deg, #374151 0%, #1f2937 100%)";
                  }
                })(),
                padding: "20px 24px",
                color: "#fff",
                position: "relative"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {selectedNews.category}
                    </span>
                    {selectedNews.isNew && (
                      <span style={{
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "2px 8px",
                        borderRadius: "8px"
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <button
                    onClick={closeNewsDetail}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "#fff",
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s ease"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{
                    fontSize: "13px",
                    opacity: 0.9,
                    fontWeight: "400"
                  }}>
                    {formatDate(selectedNews.date)}
                  </span>
                </div>
              </div>

              {/* 学校情報セクション */}
              <div style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "#475569"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>🏫</span>
                    <span>東京都立○○高等学校</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>👥</span>
                    <span>2年A組</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>📚</span>
                    <span>数学科</span>
                  </div>
                </div>
              </div>

              {/* モーダルコンテンツ */}
              <div style={{
                padding: "24px",
                maxHeight: "400px",
                overflowY: "auto"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "16px",
                  lineHeight: "1.3"
                }}>
                  {selectedNews.title}
                </h2>
                <div style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedNews.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DesktopFrame>
  );
}