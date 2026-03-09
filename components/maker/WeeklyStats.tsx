import React from "react";
import type { WeeklyStatsData } from "../../types/toukei";

interface WeeklyStatsProps {
  emotionLabel: string;
  data: WeeklyStatsData;
  onClose: () => void;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ emotionLabel, data, onClose }) => {
  const { weekDays, values, totalCount, average, trend } = data;
  // ラベルは親から新仕様で渡される
  // 最大値を求めてグラフの高さを正規化
  const maxValue = Math.max(...values);
  const normalizedValues = values.map((v: number) => (v / maxValue) * 100);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "800px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px -10px rgba(0, 0, 0, 0.3)",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          borderBottom: "2px solid #f1f5f9",
          paddingBottom: "16px"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            color: "#1e293b"
          }}>
            📊 {emotionLabel} - 1週間統計
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            ✕ 閉じる
          </button>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          marginBottom: "24px"
        }}>
          {/* 週間グラフ */}
          <div style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#374151"
            }}>
              📈 週間推移
            </h3>
            <div style={{
              display: "flex",
              alignItems: "end",
              gap: "8px",
              height: "200px",
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb"
            }}>
              {weekDays.map((day: string, index: number) => (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "4px"
                  }}>
                    {Number(values[index]).toFixed(1)}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#3b82f6",
                      borderRadius: "4px 4px 0 0",
                      height: `${normalizedValues[index]}%`,
                      minHeight: "8px",
                      transition: "all 0.3s ease"
                    }}
                  />
                  <div style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#374151",
                    textAlign: "center"
                  }}>
                    {day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* サマリー情報 */}
          <div style={{
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#374151"
            }}>
              📋 サマリー
            </h3>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "4px"
                }}>
                  合計発生回数
                </div>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1e293b"
                }}>
                  {totalCount} 回
                </div>
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "4px"
                }}>
                  1日平均
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#059669"
                }}>
                  {average.toFixed(1)} 回
                </div>
              </div>

              <div>
                <div style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "4px"
                }}>
                  週間傾向
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  color: trend === "上昇" ? "#059669" : trend === "下降" ? "#dc2626" : "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {trend === "上昇" ? "📈" : trend === "下降" ? "📉" : "📊"} {trend}傾向
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細データテーブル */}
        <div style={{
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#374151"
          }}>
            📊 詳細データ
          </h3>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    曜日
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    発生回数
                  </th>
                  <th style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    傾向
                  </th>
                </tr>
              </thead>
              <tbody>
                {weekDays.map((day: string, index: number) => (
                  <tr key={day} style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9fafb"
                  }}>
                    <td style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      color: "#374151",
                      fontWeight: "500"
                    }}>
                      {day}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#1e293b"
                    }}>
                      {Number(values[index]).toFixed(1)}
                    </td>
                    <td style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontSize: "12px"
                    }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backgroundColor: values[index] >= average ? "#dcfce7" : "#fef3c7",
                        color: values[index] >= average ? "#166534" : "#92400e",
                        fontWeight: "500"
                      }}>
                        {values[index] >= average ? "平均以上" : "平均以下"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStats;