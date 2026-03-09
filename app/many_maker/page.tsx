"use client";
import EducationBoardFrame from "../../components/frame/EducationBoardFrame";
import React, { useState, useEffect } from "react";

// 許可された教育委員会のメールアドレス
const AUTHORIZED_EMAILS = [
  "kyoiku.admin@city.tokyo.jp",
  "board@tokyo.education.jp",
  "supervisor@edu.tokyo.gov.jp"
];

interface SchoolData {
  id: number;
  name: string;
  district: string;
  studentCount: number;
  teacherCount: number;
  grade: string[];
  lastUpdate: string;
  status: "正常" | "要注意" | "緊急";
  emotionAlert: number;
  newsCount: number;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: "重要" | "お知らせ" | "メンテナンス" | "アップデート";
  isNew: boolean;
  schoolId?: number;
  schoolName?: string;
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
  schoolId: number;
  schoolName: string;
}

export default function EducationBoard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [schoolsData, setSchoolsData] = useState<SchoolData[]>([]);
  const [showSchoolDetail, setShowSchoolDetail] = useState(false);
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

  // 認証チェック
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // 実際の実装では、ここでFirebaseやその他の認証システムからユーザー情報を取得
        // デモ用に仮のメールアドレスを設定
        const currentUserEmail = "kyoiku.admin@city.tokyo.jp"; // 実際はauth.currentUser.emailなど
        setUserEmail(currentUserEmail);
        
        if (AUTHORIZED_EMAILS.includes(currentUserEmail)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, []);

  // 学校データの取得
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchSchoolsData = async () => {
      try {
        // 学校データの模擬データ
        const testSchoolsData: SchoolData[] = [
          {
            id: 1,
            name: "第一小学校",
            district: "東京",
            studentCount: 500,
            teacherCount: 30,
            grade: ["1年", "2年", "3年", "4年", "5年", "6年"],
            lastUpdate: "2025-11-18T10:30:00Z",
            status: "正常",
            emotionAlert: 2,
            newsCount: 1
          },
          {
            id: 2,
            name: "第二小学校",
            district: "東京",
            studentCount: 450,
            teacherCount: 28,
            grade: ["1年", "2年", "3年", "4年", "5年", "6年"],
            lastUpdate: "2025-11-18T09:15:00Z",
            status: "要注意",
            emotionAlert: 1,
            newsCount: 2
          },
          {
            id: 3,
            name: "第三小学校",
            district: "東京",
            studentCount: 480,
            teacherCount: 29,
            grade: ["1年", "2年", "3年", "4年", "5年", "6年"],
            lastUpdate: "2025-11-18T11:00:00Z",
            status: "緊急",
            emotionAlert: 3,
            newsCount: 3
          }
        ];

        setSchoolsData(testSchoolsData);
        setError(null);
      } catch (err) {
        console.error("学校データ取得エラー:", err);
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolsData();
  }, [isAuthorized]);

  // JSONファイルからニュースデータを取得（全学校分）
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // 全学校のニュースデータ（模擬データ）
        const allSchoolNews: NewsItem[] = [
          {
            id: 1,
            title: "緊急：感情分析で異常値検出",
            content: "2年A組で複数生徒の感情状態に急激な変化が見られます。至急対応が必要です。",
            date: "2025-11-18T10:30:00Z",
            category: "重要",
            isNew: true,
            schoolId: 1,
            schoolName: "都立桜台高等学校"
          },
          {
            id: 2,
            title: "システムメンテナンスのお知らせ",
            content: "明日の午前2時〜4時にシステムメンテナンスを実施します。",
            date: "2025-11-17T15:00:00Z",
            category: "メンテナンス",
            isNew: false,
            schoolId: 2,
            schoolName: "都立新宿高等学校"
          },
          {
            id: 3,
            title: "月次レポート完成",
            content: "10月分の感情分析レポートが完成しました。",
            date: "2025-11-15T09:00:00Z",
            category: "お知らせ",
            isNew: true,
            schoolId: 3,
            schoolName: "都立渋谷高等学校"
          },
          {
            id: 4,
            title: "新機能追加のお知らせ",
            content: "感情分析機能にリアルタイム通知機能が追加されました。",
            date: "2025-11-14T14:30:00Z",
            category: "アップデート",
            isNew: false,
            schoolId: 4,
            schoolName: "都立豊島高等学校"
          },
          {
            id: 5,
            title: "要注意：複数クラスで感情変化",
            content: "1年生の複数クラスで同時期に感情変化が観察されています。",
            date: "2025-11-18T08:00:00Z",
            category: "重要",
            isNew: true,
            schoolId: 5,
            schoolName: "都立世田谷高等学校"
          }
        ];
        
        // 日付でソート（新しい順）
        const sortedNews = allSchoolNews.sort((a, b) => 
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
  }, [isAuthorized]);

  // JSONファイルから感情データを取得（全学校分）
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchEmotionData = async () => {
      try {
        setEmotionLoading(true);
        
        // 全学校の感情急激変化通知データ
        const testEmotionAlerts: EmotionAlert[] = [
          {
            id: 1,
            emotion: "怒り",
            change: 45,
            severity: "high",
            timestamp: "2025-11-18T10:30:00Z",
            description: "怒りが45%上昇しました。クラス内でのトラブルが疑われます。",
            isRead: false,
            schoolId: 1,
            schoolName: "都立桜台高等学校"
          },
          {
            id: 2,
            emotion: "不安",
            change: 35,
            severity: "high",
            timestamp: "2025-11-18T10:15:00Z",
            description: "不安が35%上昇しました。試験期間の影響が考えられます。",
            isRead: false,
            schoolId: 1,
            schoolName: "都立桜台高等学校"
          },
          {
            id: 3,
            emotion: "悲しみ",
            change: 25,
            severity: "medium",
            timestamp: "2025-11-18T09:30:00Z",
            description: "悲しみが25%上昇しました。",
            isRead: true,
            schoolId: 2,
            schoolName: "都立新宿高等学校"
          },
          {
            id: 4,
            emotion: "恐怖",
            change: 30,
            severity: "high",
            timestamp: "2025-11-18T08:45:00Z",
            description: "恐怖が30%上昇しました。",
            isRead: false,
            schoolId: 5,
            schoolName: "都立世田谷高等学校"
          },
          {
            id: 5,
            emotion: "喜び",
            change: -40,
            severity: "medium",
            timestamp: "2025-11-18T08:00:00Z",
            description: "喜びが40%下降しました。",
            isRead: true,
            schoolId: 5,
            schoolName: "都立世田谷高等学校"
          }
        ];

        setEmotionAlerts(testEmotionAlerts);
        setEmotionError(null);
      } catch (err) {
        console.error("感情データ取得エラー:", err);
        setEmotionError(err instanceof Error ? err.message : "不明なエラーが発生しました");
      } finally {
        setEmotionLoading(false);
      }
    };

    fetchEmotionData();
  }, [isAuthorized]);

  // 学校詳細を開く
  const openSchoolDetail = (school: SchoolData) => {
    setSelectedSchool(school);
    setShowSchoolDetail(true);
  };

  // 学校詳細を閉じる
  const closeSchoolDetail = () => {
    setShowSchoolDetail(false);
    setSelectedSchool(null);
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

  // 学校ステータスの色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case "緊急": return { bg: "#dc2626", text: "#fff" };
      case "要注意": return { bg: "#d97706", text: "#fff" };
      case "正常": return { bg: "#059669", text: "#fff" };
      default: return { bg: "#6b7280", text: "#fff" };
    }
  };

  // 認証されていない場合のエラーページ
  if (isAuthorized === false) {
    return (
      <EducationBoardFrame>
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          backgroundColor: "#f3f4f6", 
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            width: "100%"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
            <h1 style={{ 
              fontSize: "24px", 
              fontWeight: "bold", 
              color: "#dc2626",
              marginBottom: "12px"
            }}>
              アクセス権限がありません
            </h1>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px",
              marginBottom: "20px",
              lineHeight: "1.5"
            }}>
              このページにアクセスするには、教育委員会の認証されたメールアドレスが必要です。
              <br />
              現在のメールアドレス: {userEmail}
            </p>
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "12px",
              color: "#991b1b"
            }}>
              許可されたメールアドレスでログインしてください。
            </div>
          </div>
        </div>
      </EducationBoardFrame>
    );
  }

  // 読み込み中の表示
  if (isAuthorized === null) {
    return (
      <EducationBoardFrame>
        <div style={{ 
          padding: "40px", 
          textAlign: "center", 
          backgroundColor: "#f3f4f6", 
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🔄</div>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              認証を確認しています...
            </p>
          </div>
        </div>
      </EducationBoardFrame>
    );
  }

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
    <EducationBoardFrame>
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
              教育委員会ダッシュボード
            </h1>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px",
              margin: "0 0 4px 0"
            }}>
              担当地区の学校情報を統括管理
            </p>
            <p style={{ 
              color: "#3b82f6", 
              fontSize: "12px",
              margin: "0 0 16px 0"
            }}>
              ログイン: {userEmail}
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

        {/* 学校一覧セクション */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginBottom: "16px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "#ffffff",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>🏫</span>
            <span>管轄学校一覧</span>
            <span style={{
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500"
            }}>
              {schoolsData.length}校
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            padding: "20px"
          }}>
            {schoolsData.map((school) => (
              <div
                key={school.id}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  position: "relative"
                }}
                onClick={() => openSchoolDetail(school)}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* 学校名とステータス */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px"
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1f2937",
                      margin: "0 0 4px 0"
                    }}>
                      {school.name}
                    </h3>
                    <p style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: 0
                    }}>
                      📍 {school.district}
                    </p>
                  </div>
                  <span style={{
                    background: getStatusColor(school.status).bg,
                    color: getStatusColor(school.status).text,
                    fontSize: "10px",
                    fontWeight: "600",
                    padding: "4px 8px",
                    borderRadius: "6px"
                  }}>
                    {school.status}
                  </span>
                </div>

                {/* 統計情報 */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    background: "#fff",
                    padding: "8px",
                    borderRadius: "6px",
                    textAlign: "center",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#3b82f6"
                    }}>
                      {school.studentCount.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: "#6b7280"
                    }}>
                      生徒数
                    </div>
                  </div>
                  <div style={{
                    background: "#fff",
                    padding: "8px",
                    borderRadius: "6px",
                    textAlign: "center",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#10b981"
                    }}>
                      {school.teacherCount}
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: "#6b7280"
                    }}>
                      教員数
                    </div>
                  </div>
                </div>

                {/* アラート情報 */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {school.emotionAlert > 0 && (
                      <span style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                      }}>
                        🚨 {school.emotionAlert}
                      </span>
                    )}
                    {school.newsCount > 0 && (
                      <span style={{
                        background: "#dbeafe",
                        color: "#2563eb",
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                      }}>
                        📢 {school.newsCount}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: "10px",
                    color: "#9ca3af"
                  }}>
                    更新: {formatDate(school.lastUpdate)}
                  </span>
                </div>
              </div>
            ))}
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

                      {/* タイトルと学校名 */}
                      <h3 style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#374151",
                        margin: "2px 0 2px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {item.title}
                      </h3>

                      {/* 学校名 */}
                      <p style={{
                        fontSize: "10px",
                        color: "#8b5cf6",
                        margin: "0 0 4px 0",
                        fontWeight: "500"
                      }}>
                        🏫 {item.schoolName}
                      </p>

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
                        margin: "2px 0 2px 0"
                      }}>
                        {alert.emotion} {alert.change > 0 ? "上昇" : "下降"}警告
                      </h3>

                      {/* 学校名 */}
                      <p style={{
                        fontSize: "10px",
                        color: "#8b5cf6",
                        margin: "0 0 4px 0",
                        fontWeight: "500"
                      }}>
                        🏫 {alert.schoolName}
                      </p>

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

        {/* 学校詳細モーダル */}
        {showSchoolDetail && selectedSchool && (
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
          }} onClick={closeSchoolDetail}>
            <div style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              position: "relative"
            }} onClick={e => e.stopPropagation()}>
              {/* モーダルヘッダー */}
              <div style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                padding: "20px 24px",
                color: "#fff",
                position: "relative"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>🏫</span>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" }}>
                        {selectedSchool.name}
                      </h2>
                      <p style={{ fontSize: "14px", margin: 0, opacity: 0.9 }}>
                        📍 {selectedSchool.district} | 更新: {formatDate(selectedSchool.lastUpdate)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeSchoolDetail}
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

              {/* モーダルコンテンツ */}
              <div style={{
                padding: "24px",
                maxHeight: "400px",
                overflowY: "auto"
              }}>
                {/* 基本情報 */}
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                    基本情報
                  </h3>
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "16px"
                  }}>
                    <div style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "center"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#3b82f6",
                        marginBottom: "4px"
                      }}>
                        {selectedSchool.studentCount.toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        生徒数
                      </div>
                    </div>
                    <div style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "center"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "#10b981",
                        marginBottom: "4px"
                      }}>
                        {selectedSchool.teacherCount}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        教員数
                      </div>
                    </div>
                    <div style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "center"
                    }}>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: getStatusColor(selectedSchool.status).bg,
                        marginBottom: "4px"
                      }}>
                        {selectedSchool.status}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        現在のステータス
                      </div>
                    </div>
                  </div>
                </div>

                {/* アラート情報 */}
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                    アラート状況
                  </h3>
                  <div style={{ 
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px"
                  }}>
                    <div style={{
                      background: selectedSchool.emotionAlert > 0 ? "#fee2e2" : "#f0f9ff",
                      padding: "16px",
                      borderRadius: "8px",
                      border: `1px solid ${selectedSchool.emotionAlert > 0 ? "#fecaca" : "#bae6fd"}`,
                      textAlign: "center"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: selectedSchool.emotionAlert > 0 ? "#dc2626" : "#0ea5e9",
                        marginBottom: "4px"
                      }}>
                        {selectedSchool.emotionAlert}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        感情変化アラート
                      </div>
                    </div>
                    <div style={{
                      background: selectedSchool.newsCount > 0 ? "#dbeafe" : "#f8fafc",
                      padding: "16px",
                      borderRadius: "8px",
                      border: `1px solid ${selectedSchool.newsCount > 0 ? "#93c5fd" : "#e2e8f0"}`,
                      textAlign: "center"
                    }}>
                      <div style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        color: selectedSchool.newsCount > 0 ? "#2563eb" : "#6b7280",
                        marginBottom: "4px"
                      }}>
                        {selectedSchool.newsCount}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "#6b7280"
                      }}>
                        未読ニュース
                      </div>
                    </div>
                  </div>
                </div>

                {/* アクション */}
                <div style={{
                  display: "flex",
                  gap: "12px"
                }}>
                  <button
                    onClick={() => {
                      closeSchoolDetail();
                      window.location.href = '/many_maker/report';
                    }}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "transform 0.2s ease"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    📊 詳細レポート
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "transform 0.2s ease"
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    🎯 個別指導
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <span>{selectedAlert.schoolName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>📊</span>
                    <span>感情分析システム</span>
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
                    <span>{selectedNews.schoolName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "500" }}>📢</span>
                    <span>お知らせシステム</span>
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
    </EducationBoardFrame>
  );
}