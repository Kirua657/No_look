"use client";

import { useState } from "react";
import "../../../styles/student-responsive.css";
import Image from "next/image";
import Link from "next/link";
import SmartphoneFrame from "../../../components/frame/SmartphoneFrame";
import SmartphoneHeader from "../../../components/frame/SmartphoneHeader";
import StudentBell from "../../../components/student/StudentBell";
import StudentFooter from "../../../components/student/StudentFooter";
import { useNews, getCategoryColor, formatDate } from "../../../hooks/useNews";

export default function StudentBellPage() {
  // カスタムフックでニュースデータを取得
  const { news, loading, error, newNewsCount } = useNews();
  const [showAllNews, setShowAllNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 検索されたニュースをフィルタリング
  const filteredNews = news.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });
  
  // ニュースアイテムクリックハンドラー
  const handleNewsClick = (newsItem: any) => {
    console.log('ニュースアイテムがクリックされました:', newsItem);
    setSelectedNews(newsItem);
    setShowDetail(true);
  };
  
  // 詳細モーダルを閉じる
  const closeDetailModal = () => {
    console.log('モーダルを閉じます');
    setShowDetail(false);
    setSelectedNews(null);
  };

  // テキスト内の検索語をハイライト
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #fef08a; padding: 1px 2px; border-radius: 2px;">$1</mark>');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SmartphoneFrame>
        <SmartphoneHeader />
        <div style={{ position: 'absolute', top: '25mm', right: '3mm', zIndex: 50 }}>
          <StudentBell count={newNewsCount} />
        </div>

        {/* お知らせタイトル */}
        <div style={{
          background: "#fff",
          padding: "16px 16px 8px 16px",
          marginTop: "calc(60px)",
          paddingBottom: "2cm"
        }}>
          <h1 style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: "0",
            textAlign: "center"
          }}>
            お知らせ
          </h1>
        </div>

        {/* 検索ヘッダー */}
        <div style={{
          background: "#fff",
          padding: "8px 16px 16px 16px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px"
          }}>
            <div style={{
              background: "#f3f4f6",
              borderRadius: "20px",
              padding: "8px 16px",
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative"
            }}>
              <span style={{ 
                fontSize: "14px", 
                color: "#6b7280",
                fontWeight: "500"
              }}>検索</span>
              <input
                type="text"
                placeholder="タイトル、内容、カテゴリで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "14px"
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "#6b7280",
                    padding: "2px",
                    fontWeight: "bold"
                  }}
                  title="検索をクリア"
                >
                  ×
                </button>
              )}
            </div>

            {/* 戻るボタンを検索ボックスの右側に配置 */}
            <Link href="/student/home">
              <button style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#6b7280",
                fontWeight: "bold"
              }}>
                ×
              </button>
            </Link>
          </div>

          {/* 検索結果件数表示 */}
          {searchTerm.trim() && (
            <div style={{
              fontSize: "12px",
              color: "#6b7280",
              textAlign: "center"
            }}>
              {filteredNews.length}件のお知らせが見つかりました
            </div>
          )}
        </div>

        {/* メインコンテンツエリア */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fff"
        }}>
          {/* ニュースリスト */}
          <div style={{
            background: "#fff",
            flex: 1,
            overflowY: "auto"
          }}>
          {loading ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "14px" }}>読み込み中...</div>
            </div>
          ) : error ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#dc2626"
            }}>
              <div style={{ fontSize: "14px" }}>{error}</div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "14px" }}>
                {searchTerm.trim() ? `"${searchTerm}"に一致するお知らせはありません` : "お知らせはありません"}
              </div>
            </div>
          ) : (
            filteredNews.map((item, index) => {
              console.log(`ニュースアイテム ${index}:`, item);
              return (
              <div
                key={item.id}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease"
                }}
                onClick={() => {
                  console.log('クリックされたアイテム:', item);
                  handleNewsClick(item);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{
                  fontSize: "14px",
                  color: "#374151",
                  fontWeight: "500",
                  marginBottom: "4px"
                }}
                dangerouslySetInnerHTML={{
                  __html: highlightSearchTerm(item.title, searchTerm)
                }}
                />
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: "#6b7280"
                  }}>
                    {formatDate(item.date)}
                  </div>
                  {item.isNew && (
                    <span style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}>
                      New
                    </span>
                  )}
                </div>
              </div>
              );
            })
          )}
          </div>
        </div>

        {/* 詳細モーダル */}
        {showDetail && selectedNews ? (
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000
            }} 
            onClick={closeDetailModal}
          >
            <div 
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "90%",
                width: "350px",
                maxHeight: "80%",
                overflowY: "auto",
                position: "relative"
              }} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* モーダルヘッダー */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid #e5e7eb"
              }}>
                <h2 style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1f2937",
                  margin: "0"
                }}>
                  お知らせ詳細
                </h2>
                <button
                  onClick={closeDetailModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#6b7280",
                    padding: "0",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* カテゴリタグと日付 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <span style={{
                  backgroundColor: getCategoryColor(selectedNews.category),
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {selectedNews.category}
                </span>
                <span style={{
                  fontSize: "12px",
                  color: "#6b7280"
                }}>
                  {formatDate(selectedNews.date)}
                </span>
              </div>
              
              {/* タイトル */}
              <h3 style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "16px",
                lineHeight: "1.5"
              }}>
                {selectedNews.title}
              </h3>
              
              {/* 本文 */}
              <div style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.6",
                marginBottom: "20px",
                whiteSpace: "pre-wrap",
                minHeight: "60px"
              }}>
                {selectedNews.content}
              </div>
              
              {/* Newバッジ */}
              {selectedNews.isNew && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px"
                }}>
                  <span style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: "4px 12px",
                    borderRadius: "12px"
                  }}>
                    新着情報
                  </span>
                </div>
              )}
              
              {/* フッターボタンはトップ右の × を使うため削除 */}
            </div>
          </div>
        ) : null}

        {/* 戻るボタン */}
        <div style={{
          padding: "16px",
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          position: "relative",
          zIndex: 10
        }}>
          <Link href="/student/home">
            <button style={{
              width: "100%",
              padding: "12px",
              background: "#3182ce",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3182ce";
            }}
            >
              ホームに戻る
            </button>
          </Link>
        </div>

        <StudentFooter />
      </SmartphoneFrame>
    </div>
  );
}