"use client";
import DesktopFrame from "../../components/frame/DesktopFrame";
import { useState, useEffect } from "react";

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
  // ニュースデータの状態管理
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllNews, setShowAllNews] = useState(false); // 全件表示フラグ
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null); // 選択されたニュース
  const [showNewsDetail, setShowNewsDetail] = useState(false); // ニュース詳細モーダル表示フラグ
  
  // 感情データの状態管理
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [emotionLoading, setEmotionLoading] = useState(true);
  const [emotionError, setEmotionError] = useState<string | null>(null);
  
  // 感情急激変化通知の状態管理
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
        const response = await fetch("/hyou.json");
        
        if (!response.ok) {
          throw new Error("感情データの取得に失敗しました");
        }
        
        const data: EmotionData[] = await response.json();
        setEmotionData(data);
        setEmotionError(null);
        
        // 感情急激変化通知を生成
        const alerts = generateEmotionAlerts(data);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "重要": return { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" };
      case "メンテナンス": return { bg: "#fef3c7", color: "#d97706", border: "#fcd34d" };
      case "アップデート": return { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" };
      case "お知らせ": return { bg: "#d1fae5", color: "#059669", border: "#6ee7b7" };
      default: return { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 感情急激変化を検出して通知を生成
  const generateEmotionAlerts = (data: EmotionData[]): EmotionAlert[] => {
    const alerts: EmotionAlert[] = [];
    let alertId = 1;
    
    data.forEach((emotion) => {
      const absChange = Math.abs(emotion.change);
      let severity: "high" | "medium" | "low";
      let description: string;
      
      if (absChange >= 15) {
        severity = "high";
        description = `${emotion.emotion}の数値が${emotion.change > 0 ? '大幅に増加' : '大幅に減少'}しました（${emotion.change > 0 ? '+' : ''}${emotion.change}）`;
      } else if (absChange >= 8) {
        severity = "medium";
        description = `${emotion.emotion}の数値が${emotion.change > 0 ? '増加' : '減少'}しています（${emotion.change > 0 ? '+' : ''}${emotion.change}）`;
      } else if (absChange >= 5) {
        severity = "low";
        description = `${emotion.emotion}の数値に${emotion.change > 0 ? '上昇' : '下降'}傾向があります（${emotion.change > 0 ? '+' : ''}${emotion.change}）`;
      } else {
        return; // 変化が小さい場合は通知しない
      }
      
      alerts.push({
        id: alertId++,
        emotion: emotion.emotion,
        change: emotion.change,
        severity,
        timestamp: new Date().toISOString(),
        description,
        isRead: Math.random() > 0.7 // ランダムに既読/未読を設定
      });
    });
    
    return alerts.sort((a, b) => {
      // 重要度順、未読優先でソート
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  // 通知を既読にする
  const markAlertAsRead = (alertId: number) => {
    setEmotionAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  // 感情変化詳細を開く
  const openAlertDetail = (alert: EmotionAlert) => {
    setSelectedAlert(alert);
    setShowAlertDetail(true);
    markAlertAsRead(alert.id); // 開いたときに既読にする
  };

  // 感情変化詳細を閉じる
  const closeAlertDetail = () => {
    setShowAlertDetail(false);
    setSelectedAlert(null);
  };

  // 時刻を日本語形式でフォーマット
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ニュース詳細を開く
  const openNewsDetail = (news: NewsItem) => {
    setSelectedNews(news);
    setShowNewsDetail(true);
  };

  // ニュース詳細を閉じる
  const closeNewsDetail = () => {
    setShowNewsDetail(false);
    setSelectedNews(null);
  };

  return (
    <DesktopFrame>
      <div style={{ 
        padding: "16px"
      }}>
        {/* ヘッダーセクション */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
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
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "24px"
          }}>
            <span>東京都立○○高等学校</span>
            <span>2年A組</span>
          </div>
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
              // ローディング状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                <div style={{ marginBottom: "8px" }}>📰</div>
                <div style={{ fontSize: "12px" }}>ニュースを読み込み中...</div>
              </div>
            ) : error ? (
              // エラー状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#dc2626" 
              }}>
                <div style={{ marginBottom: "8px" }}>⚠️</div>
                <div style={{ fontSize: "12px" }}>{error}</div>
              </div>
            ) : news.length === 0 ? (
              // データなし状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                <div style={{ marginBottom: "8px" }}>📋</div>
                <div style={{ fontSize: "12px" }}>ニュースはありません</div>
              </div>
            ) : (
              // ニュース表示（表示件数を動的に変更）
              (showAllNews ? news : news.slice(0, 3)).map((item, index, currentArray) => {
                const categoryStyle = getCategoryColor(item.category);
                return (
                  <div 
                    key={item.id}
                    style={{
                      borderBottom: index < currentArray.length - 1 ? "1px solid #f3f4f6" : "none",
                      padding: "8px 12px",
                      transition: "background 0.2s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                    }}
                    onClick={() => openNewsDetail(item)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      {/* NEW バッジ */}
                      {item.isNew && (
                        <div style={{
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: "7px",
                          fontWeight: "bold",
                          padding: "1px 4px",
                          borderRadius: "6px",
                          flexShrink: 0,
                          marginTop: "1px"
                        }}>
                          NEW
                        </div>
                      )}
                      
                      {/* コンテンツ */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          {/* カテゴリバッジ */}
                          <span style={{
                            background: categoryStyle.bg,
                            color: categoryStyle.color,
                            padding: "1px 6px",
                            borderRadius: "8px",
                            fontSize: "9px",
                            fontWeight: "600"
                          }}>
                            {item.category}
                          </span>
                          
                          {/* 日付 */}
                          <span style={{
                            color: "#6b7280",
                            fontSize: "9px"
                          }}>
                            {formatDate(item.date)}
                          </span>
                        </div>
                        
                        {/* タイトル */}
                        <h3 style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#1f2937",
                          margin: "0 0 2px 0",
                          lineHeight: "1.3"
                        }}>
                          {item.title}
                        </h3>
                        
                        {/* 内容 */}
                        <p style={{
                          fontSize: "10px",
                          color: "#4b5563",
                          margin: 0,
                          lineHeight: "1.3",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: showAllNews ? 3 : 1, // 全件表示時は3行まで
                          WebkitBoxOrient: "vertical"
                        }}>
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* フッター */}
          <div style={{
            background: "#f9fafb",
            padding: "6px 12px",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* 件数表示 */}
            <div style={{
              fontSize: "10px",
              color: "#6b7280"
            }}>
              {loading ? "読み込み中..." : 
               showAllNews ? `全 ${news.length} 件` : 
               `${Math.min(3, news.length)} / ${news.length} 件`}
            </div>
            
            {/* 切り替えボタン */}
            <button 
              disabled={loading || news.length <= 3}
              style={{
                background: (loading || news.length <= 3) ? "#9ca3af" : "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "4px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "500",
                cursor: (loading || news.length <= 3) ? "not-allowed" : "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => setShowAllNews(!showAllNews)}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#3b82f6";
                }
              }}
            >
              {showAllNews ? "折りたたむ" : "すべて見る"}
            </button>
          </div>
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
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            padding: "8px 12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>⚠️</span>
                <h2 style={{ 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  color: "#fff",
                  margin: 0
                }}>
                  感情変化通知
                </h2>
              </div>
              <div style={{
                background: emotionAlerts.filter(alert => !alert.isRead).length > 0 ? "#dc2626" : "#6b7280",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "9px",
                fontWeight: "600"
              }}>
                {emotionAlerts.filter(alert => !alert.isRead).length}
              </div>
            </div>
          </div>

          {/* 通知リスト */}
          <div style={{ 
            maxHeight: showAllAlerts ? "300px" : "150px", 
            overflowY: "auto",
            transition: "max-height 0.3s ease"
          }}>
            {emotionAlerts.length === 0 ? (
              // 通知なし状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                <div style={{ marginBottom: "8px" }}>🎯</div>
                <div style={{ fontSize: "12px" }}>感情の急激な変化は検出されていません</div>
              </div>
            ) : (
              // 通知表示（表示件数を動的に変更）
              (showAllAlerts ? emotionAlerts : emotionAlerts.slice(0, 3)).map((alert, index, currentArray) => {
                const getSeverityStyle = (severity: string) => {
                  switch (severity) {
                    case "high": return { bg: "#fee2e2", color: "#dc2626", icon: "🔴" };
                    case "medium": return { bg: "#fef3c7", color: "#d97706", icon: "🟡" };
                    case "low": return { bg: "#dbeafe", color: "#2563eb", icon: "🔵" };
                    default: return { bg: "#f3f4f6", color: "#374151", icon: "⚪" };
                  }
                };
                
                const severityStyle = getSeverityStyle(alert.severity);
                
                return (
                  <div 
                    key={alert.id}
                    style={{
                      borderBottom: index < currentArray.length - 1 ? "1px solid #f3f4f6" : "none",
                      padding: "10px 12px",
                      transition: "background 0.2s ease",
                      cursor: "pointer",
                      background: alert.isRead ? "#fff" : "#fefbf3",
                      borderLeft: alert.isRead ? "none" : "3px solid #f59e0b"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = alert.isRead ? "#fff" : "#fefbf3";
                    }}
                    onClick={() => openAlertDetail(alert)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      {/* 重要度アイコン */}
                      <div style={{
                        background: severityStyle.bg,
                        color: severityStyle.color,
                        padding: "4px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        flexShrink: 0,
                        marginTop: "1px"
                      }}>
                        {severityStyle.icon}
                      </div>
                      
                      {/* コンテンツ */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          {/* 感情名バッジ */}
                          <span style={{
                            background: "#3b82f6",
                            color: "#fff",
                            padding: "1px 6px",
                            borderRadius: "8px",
                            fontSize: "9px",
                            fontWeight: "600"
                          }}>
                            {alert.emotion}
                          </span>
                          
                          {/* 変化量バッジ */}
                          <span style={{
                            background: alert.change > 0 ? "#dcfce7" : "#fef2f2",
                            color: alert.change > 0 ? "#059669" : "#dc2626",
                            padding: "1px 6px",
                            borderRadius: "8px",
                            fontSize: "9px",
                            fontWeight: "600"
                          }}>
                            {alert.change > 0 ? "+" : ""}{alert.change}
                          </span>
                          
                          {/* 時刻 */}
                          <span style={{
                            color: "#6b7280",
                            fontSize: "9px",
                            marginLeft: "auto"
                          }}>
                            {formatTime(alert.timestamp)}
                          </span>
                          
                          {/* 未読マーカー */}
                          {!alert.isRead && (
                            <div style={{
                              width: "6px",
                              height: "6px",
                              background: "#f59e0b",
                              borderRadius: "50%",
                              flexShrink: 0
                            }} />
                          )}
                        </div>
                        
                        {/* 説明文 */}
                        <p style={{
                          fontSize: "11px",
                          color: "#4b5563",
                          margin: 0,
                          lineHeight: "1.4",
                          fontWeight: alert.isRead ? "400" : "500"
                        }}>
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 通知フッター */}
          <div style={{
            background: "#f9fafb",
            padding: "6px 12px",
            textAlign: "center",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* 件数表示 */}
            <div style={{
              fontSize: "10px",
              color: "#6b7280"
            }}>
              {emotionAlerts.length === 0 ? "通知なし" : 
               showAllAlerts ? `全 ${emotionAlerts.length} 件` : 
               `${Math.min(3, emotionAlerts.length)} / ${emotionAlerts.length} 件`}
            </div>
            
            {/* 切り替えボタン */}
            <button 
              disabled={emotionAlerts.length <= 3}
              style={{
                background: emotionAlerts.length <= 3 ? "#9ca3af" : "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "4px 12px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "500",
                cursor: emotionAlerts.length <= 3 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = "#3b82f6";
                }
              }}
            >
              {showAllAlerts ? "折りたたむ" : "すべて見る"}
            </button>
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
              maxWidth: "500px",
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
                    case "medium": return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
                    case "low": return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
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
                      {selectedAlert.emotion}
                    </span>
                    <span style={{
                      background: selectedAlert.change > 0 ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>
                      {selectedAlert.change > 0 ? "+" : ""}{selectedAlert.change}
                    </span>
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <span style={{
                    fontSize: "13px",
                    opacity: 0.9,
                    fontWeight: "400"
                  }}>
                    {formatTime(selectedAlert.timestamp)}
                  </span>
                </div>
              </div>

              {/* 学校情報 */}
              <div style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                padding: "16px 24px"
              }}>
                <div style={{ display: "flex", gap: "24px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", fontWeight: "500" }}>
                      学校名
                    </div>
                    <div style={{ fontSize: "14px", color: "#374151", fontWeight: "600" }}>
                      東京都立○○高等学校
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", fontWeight: "500" }}>
                      担任クラス
                    </div>
                    <div style={{ fontSize: "14px", color: "#374151", fontWeight: "600" }}>
                      2年A組
                    </div>
                  </div>
                </div>
              </div>

              {/* モーダルコンテンツ */}
              <div style={{
                padding: "24px",
                maxHeight: "calc(80vh - 140px)",
                overflow: "auto"
              }}>
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 16px 0",
                  lineHeight: "1.4"
                }}>
                  感情変化の詳細分析
                </h2>
                
                {/* 変化の概要 */}
                <div style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    margin: "0 0 8px 0"
                  }}>変化の概要</h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    margin: 0,
                    lineHeight: "1.5"
                  }}>
                    {selectedAlert.description}
                  </p>
                </div>

                {/* 詳細情報 */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    background: "#f1f5f9",
                    padding: "12px",
                    borderRadius: "8px"
                  }}>
                    <div style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "500",
                      marginBottom: "4px"
                    }}>重要度レベル</div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: (() => {
                        switch (selectedAlert.severity) {
                          case "high": return "#dc2626";
                          case "medium": return "#d97706";
                          case "low": return "#2563eb";
                          default: return "#374151";
                        }
                      })()
                    }}>
                      {selectedAlert.severity === "high" ? "高レベル" : 
                       selectedAlert.severity === "medium" ? "中レベル" : "低レベル"}
                    </div>
                  </div>
                  
                  <div style={{
                    background: "#f1f5f9",
                    padding: "12px",
                    borderRadius: "8px"
                  }}>
                    <div style={{
                      fontSize: "11px",
                      color: "#64748b",
                      fontWeight: "500",
                      marginBottom: "4px"
                    }}>変化傾向</div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: selectedAlert.change > 0 ? "#059669" : "#dc2626"
                    }}>
                      {selectedAlert.change > 0 ? "上昇傾向" : "下降傾向"}
                    </div>
                  </div>
                </div>

                {/* 推奨アクション */}
                <div style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "16px",
                  borderRadius: "12px",
                  marginBottom: "16px"
                }}>
                  <h3 style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#047857",
                    margin: "0 0 8px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    💡 推奨アクション
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#065f46",
                    margin: 0,
                    lineHeight: "1.5"
                  }}>
                    {(() => {
                      if (selectedAlert.severity === "high") {
                        return selectedAlert.change > 0 
                          ? "急激な感情の上昇が見られます。生徒との面談や追加のサポートを検討してください。"
                          : "急激な感情の下降が見られます。即座に生徒の状況を確認し、必要に応じてカウンセラーとの相談を検討してください。";
                      } else if (selectedAlert.severity === "medium") {
                        return selectedAlert.change > 0
                          ? "感情の改善傾向が見られます。この調子を維持できるよう継続的な観察を行ってください。"
                          : "感情の悪化傾向が見られます。生徒との対話を増やし、支援方法を見直すことをお勧めします。";
                      } else {
                        return "軽微な変化が見られます。継続的な観察を続け、他の指標と合わせて総合的に判断してください。";
                      }
                    })()}
                  </p>
                </div>

                {/* 関連データ */}
                <div style={{
                  background: "#fef7ff",
                  border: "1px solid #e879f9",
                  padding: "16px",
                  borderRadius: "12px"
                }}>
                  <h3 style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#a21caf",
                    margin: "0 0 8px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    📈 関連データ
                  </h3>
                  <ul style={{
                    fontSize: "13px",
                    color: "#86198f",
                    margin: 0,
                    paddingLeft: "16px",
                    lineHeight: "1.5"
                  }}>
                    <li>この感情変化は過去7日間のデータに基づいて検出されました</li>
                    <li>類似の変化パターンについて統計ページで確認できます</li>
                    <li>個別の生徒データについてはカレンダーページで詳細を確認してください</li>
                  </ul>
                </div>
              </div>

              {/* モーダルフッター */}
              <div style={{
                background: "#f8fafc",
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px"
              }}>
                <button
                  onClick={closeAlertDetail}
                  style={{
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4b5563";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#6b7280";
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
                  const categoryStyle = getCategoryColor(selectedNews.category);
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
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
                </div>
              </div>

              {/* モーダルコンテンツ */}
              <div style={{
                padding: "24px",
                maxHeight: "calc(80vh - 140px)",
                overflow: "auto"
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0 0 16px 0",
                  lineHeight: "1.4"
                }}>
                  {selectedNews.title}
                </h2>
                
                <div style={{
                  fontSize: "15px",
                  color: "#374151",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedNews.content}
                </div>
              </div>

              {/* モーダルフッター */}
              <div style={{
                background: "#f8fafc",
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px"
              }}>
                <button
                  onClick={closeNewsDetail}
                  style={{
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4b5563";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#6b7280";
                  }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 感情データセクション */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginTop: "19px", // 5mm ≈ 19px
          marginBottom: "20px" // 下部に余白を追加
        }}>
          {/* 感情データヘッダー */}
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

          {/* 感情データテーブル */}
          <div style={{ 
            overflowX: "auto",
            overflowY: "hidden",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch" // iOS向けのスムーズスクロール
          }}>
            {emotionLoading ? (
              // ローディング状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                <div style={{ marginBottom: "8px" }}>📊</div>
                <div style={{ fontSize: "12px" }}>感情データを読み込み中...</div>
              </div>
            ) : emotionError ? (
              // エラー状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#dc2626" 
              }}>
                <div style={{ marginBottom: "8px" }}>⚠️</div>
                <div style={{ fontSize: "12px" }}>{emotionError}</div>
              </div>
            ) : emotionData.length === 0 ? (
              // データなし状態
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                <div style={{ marginBottom: "8px" }}>📋</div>
                <div style={{ fontSize: "12px" }}>感情データはありません</div>
              </div>
            ) : (
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "11px"
              }}>
                <thead>
                  <tr style={{ 
                    background: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0"
                  }}>
                    <th style={{ 
                      padding: "8px 6px", 
                      textAlign: "left", 
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "80px"
                    }}>
                      感情
                    </th>
                    <th style={{ 
                      padding: "8px 6px", 
                      textAlign: "center", 
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "60px"
                    }}>
                      前日
                    </th>
                    <th style={{ 
                      padding: "8px 6px", 
                      textAlign: "center", 
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "60px"
                    }}>
                      本日
                    </th>
                    <th style={{ 
                      padding: "8px 6px", 
                      textAlign: "center", 
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "50px"
                    }}>
                      増減値
                    </th>
                    <th style={{ 
                      padding: "8px 6px", 
                      textAlign: "center", 
                      fontWeight: "600",
                      color: "#374151",
                      minWidth: "50px"
                    }}>
                      人数
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emotionData.map((item, index) => (
                    <tr 
                      key={item.id}
                      style={{ 
                        background: index % 2 === 0 ? "#fff" : "#f8fafc",
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e0f2fe";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#f8fafc";
                      }}
                    >
                      {/* 感情 */}
                      <td style={{ 
                        padding: "8px 6px",
                        fontWeight: "500",
                        color: "#1f2937"
                      }}>
                        {item.emotion}
                      </td>
                      
                      {/* 前日の結果 */}
                      <td style={{ 
                        padding: "8px 6px", 
                        textAlign: "center",
                        color: "#4b5563"
                      }}>
                        {item.yesterdayResult}
                      </td>
                      
                      {/* 本日の結果 */}
                      <td style={{ 
                        padding: "8px 6px", 
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#1f2937"
                      }}>
                        {item.todayResult}
                      </td>
                      
                      {/* 増減値 */}
                      <td style={{ 
                        padding: "8px 6px", 
                        textAlign: "center",
                        fontWeight: "600"
                      }}>
                        <span style={{
                          color: item.change > 0 ? "#059669" : item.change < 0 ? "#dc2626" : "#6b7280",
                          background: item.change > 0 ? "#ecfdf5" : item.change < 0 ? "#fef2f2" : "#f3f4f6",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontSize: "10px"
                        }}>
                          {item.change > 0 ? "+" : ""}{item.change}
                        </span>
                      </td>
                      
                      {/* 人数 */}
                      <td style={{ 
                        padding: "8px 6px", 
                        textAlign: "center",
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
      </div>
    </DesktopFrame>
  );
}
