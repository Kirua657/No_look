"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import DesktopFrame from "../../../components/frame/DesktopFrame";
import ToukeiPieChart from "../../../components/maker/toukei";
import MultiLineChart from "../../../components/maker/MultiLineChart";
import WeeklyStats from "../../../components/maker/WeeklyStats";
import type { WeeklyStatsData } from "../../../types/toukei";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DatePage() {
    // ...schoolCardsData定義の直後に追加
    const tableRef = useRef<HTMLDivElement>(null);
    const fullReportRef = useRef<HTMLDivElement>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [sampleData, setSampleData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [aiComment, setAiComment] = useState<string>("");
  const [isGeneratingComment, setIsGeneratingComment] = useState<boolean>(false);
  const [showWeeklyStats, setShowWeeklyStats] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [weeklyStatsData, setWeeklyStatsData] = useState<WeeklyStatsData | null>(null);
  // 学校一覧カード用データ（統一済み）
  const schoolCardsData = [
    {
      id: 1,
      name: "第一小学校",
      district: "東京",
      studentCount: 500,
      teacherCount: 30,
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
      status: "緊急",
      emotionAlert: 3,
      newsCount: 3
    }
  ];

  useEffect(() => {
    // chartData.jsonを読み込む
    fetch("/chartData.json")
      .then(res => res.json())
      .then(data => {
        console.log('Loaded data:', data);
        setSampleData(data.pieData || []);
        setDates(data.dates || []);
        setLineData(data.lineData || []);
      })
      .catch(error => {
        console.error("データ読み込みエラー:", error);
        // フォールバックデータ
        setSampleData([
          { label: "楽しい", value: 85, color: "#22c55e" },
          { label: "悲しい", value: 35, color: "#3b82f6" },
          { label: "怒り", value: 25, color: "#ef4444" },
          { label: "不安", value: 45, color: "#f59e0b" },
          { label: "しんどい", value: 60, color: "#8b5cf6" },
          { label: "中立", value: 70, color: "#06b6d4" }
        ]);
        setDates(["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07"]);
        setLineData([
          { label: "楽しい", values: [70, 75, 80, 85, 88, 90, 85] },
          { label: "悲しい", values: [40, 38, 36, 35, 33, 30, 35] },
          { label: "怒り", values: [30, 28, 26, 25, 23, 20, 25] },
          { label: "不安", values: [50, 48, 46, 45, 43, 40, 45] },
          { label: "しんどい", values: [65, 63, 62, 60, 58, 55, 60] },
          { label: "中立", values: [60, 65, 68, 70, 72, 75, 70] }
        ]);
      });
  }, []);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
  };

  const generateAiComment = async () => {
    setIsGeneratingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const randomComments = [
        "感情分析レポート：\n\n喜・集が65%で良好な学習環境です\n疲・困が若干増加、負荷調整を推奨\n個別対応が必要な生徒は約20%",
        "クラス状況分析：\n\nポジティブ感情（喜・集）が安定して高水準維持\n憂・哀の感情が前月比15%減少で改善傾向\n疲を示す生徒3名程度に注意が必要"
      ];
      setAiComment(randomComments[Math.floor(Math.random() * randomComments.length)]);
    } catch (error) {
      setAiComment("分析中にエラーが発生しました。再度お試しください。");
    } finally {
      setIsGeneratingComment(false);
    }
  };

  // 週間統計データを生成する関数
  const generateWeeklyData = (emotion: string): WeeklyStatsData => {
    const weekDays = ["月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"];
    // 新仕様ラベル
    const baseValues: { [key: string]: number[] } = {
      "楽しい": [12, 15, 18, 22, 28, 25, 20],
      "悲しい": [8, 6, 5, 4, 3, 7, 9],
      "怒り": [3, 2, 4, 6, 8, 5, 2],
      "不安": [10, 8, 12, 15, 18, 14, 8],
      "しんどい": [15, 18, 22, 25, 30, 20, 15],
      "中立": [20, 25, 28, 30, 32, 28, 22]
    };
    const values = baseValues[emotion] || [10, 12, 8, 15, 18, 14, 11];
    const totalCount = values.reduce((sum, val) => sum + val, 0);
    const average = totalCount / values.length;
    
    // トレンドを判定
    const firstHalf = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const secondHalf = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const trendValue = secondHalf - firstHalf;
    
    let trend: "上昇" | "下降" | "安定";
    if (trendValue > 2) trend = "上昇";
    else if (trendValue < -2) trend = "下降";
    else trend = "安定";
    
    return {
      weekDays,
      values,
      totalCount,
      average,
      trend
    };
  };

  // 円グラフのセグメントクリックハンドラー
  const handlePieSegmentClick = (label: string) => {
    const weeklyData = generateWeeklyData(label);
    setSelectedEmotion(label);
    setWeeklyStatsData(weeklyData);
    setShowWeeklyStats(true);
  };

  const closeWeeklyStats = () => {
    setShowWeeklyStats(false);
    setSelectedEmotion("");
    setWeeklyStatsData(null);
  };

  const exportToPDF = async () => {
    if (!fullReportRef.current) return;
    try {
      // グラフの描画を待つための遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      // 1ページ目: 円グラフ + 詳細データ + AI分析
      const topSectionRef = tableRef.current;
      if (topSectionRef) {
        const canvas1 = await html2canvas(topSectionRef, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: topSectionRef.scrollWidth + 50,
          height: topSectionRef.scrollHeight + 50,
          scrollX: 0,
          scrollY: 0
        });
        
        const imgData1 = canvas1.toDataURL('image/png');
        const imgWidth = 297;
        const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
        
        pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth, Math.min(imgHeight1, 210));
      }
      
      // 2ページ目: 折れ線グラフ + トレンド分析
      const bottomSection = fullReportRef.current.children[1] as HTMLElement;
      if (bottomSection) {
        pdf.addPage();
        
        const canvas2 = await html2canvas(bottomSection, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: bottomSection.scrollWidth + 100,
          height: bottomSection.scrollHeight + 50,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            const svgs = clonedDoc.querySelectorAll('svg');
            svgs.forEach(svg => {
              svg.style.overflow = 'visible';
              svg.style.width = '100%';
            });
          }
        });
        
        const imgData2 = canvas2.toDataURL('image/png');
        const imgHeight2 = (canvas2.height * 297) / canvas2.width;
        
        pdf.addImage(imgData2, 'PNG', 0, 0, 297, Math.min(imgHeight2, 210));
      }
      
      pdf.save(`統計レポート_${selectedSchool}_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error('PDF出力エラー:', error);
      alert('PDF出力中にエラーが発生しました。');
    }
  };

  const exportToJPEG = async () => {
    if (!fullReportRef.current) return;
    try {
      // グラフの描画を待つための遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const timestamp = new Date().toLocaleDateString();
      
      // 1枚目: 円グラフ + 詳細データ + AI分析
      const topSectionRef = tableRef.current;
      if (topSectionRef) {
        const canvas1 = await html2canvas(topSectionRef, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: topSectionRef.scrollWidth + 50,
          height: topSectionRef.scrollHeight + 50,
          scrollX: 0,
          scrollY: 0
        });
        
        const link1 = document.createElement('a');
        link1.download = `統計レポート_円グラフ_${selectedSchool}_${timestamp}.jpg`;
        link1.href = canvas1.toDataURL('image/jpeg', 0.9);
        link1.click();
      }
      
      // 少し遅延を入れてから2枚目をダウンロード
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2枚目: 折れ線グラフ + トレンド分析
      const bottomSection = fullReportRef.current.children[1] as HTMLElement;
      if (bottomSection) {
        const canvas2 = await html2canvas(bottomSection, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: bottomSection.scrollWidth + 100,
          height: bottomSection.scrollHeight + 50,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            const svgs = clonedDoc.querySelectorAll('svg');
            svgs.forEach(svg => {
              svg.style.overflow = 'visible';
              svg.style.width = '100%';
            });
          }
        });
        
        const link2 = document.createElement('a');
        link2.download = `統計レポート_折れ線グラフ_${selectedSchool}_${timestamp}.jpg`;
        link2.href = canvas2.toDataURL('image/jpeg', 0.9);
        link2.click();
      }
      
    } catch (error) {
      console.error('JPEG出力エラー:', error);
      alert('JPEG出力中にエラーが発生しました。');
    }
  };

  return (
    <DesktopFrame>
      <div className={styles.container}>
        {/* 学校一覧カード表示（上部） */}
        <h1 style={{ 
          fontSize: "36px", 
          fontWeight: "bold", 
          color: "#1e293b", 
          marginBottom: "16px", 
          marginTop: "40px", 
          marginLeft: "2cm",
          paddingBottom: "12px",
          borderBottom: "3px solid #3b82f6"
        }}>
          統計データ
        </h1>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          marginTop: "8px",
          padding: "0 20px"
        }}>
          
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={exportToPDF} style={{
              padding: "12px 24px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
               📄 PDF出力
            </button>
            <button onClick={exportToJPEG} style={{
              padding: "12px 24px",
              backgroundColor: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
               🖼️ JPEG出力
            </button>
          </div>
        </div>

        {/* 全体レポート（円グラフ + 分析データ + 折れ線グラフ）をPDF/JPEG保存用にref適用 */}
        <div ref={fullReportRef} className={styles.container}>
          {/* 上段: 円グラフとサマリー */}
          <div className={styles.flexRow}>
            <div ref={tableRef} className={styles.card} style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40}}>
              <div className={styles.flexCol} style={{ flex: "1 1 320px" }}>
                <h3 style={{
                  margin: "0 0 16px 0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}>📊 データ分布</h3>
                <div style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  textAlign: "center",
                  marginBottom: "8px"
                }}>
                  💆‍♀️ クリックで週間統計を表示
                </div>
                {sampleData.length > 0 ? (
                  <ToukeiPieChart 
                    data={sampleData} 
                    size={320} 
                    onSegmentClick={handlePieSegmentClick}
                  />
                ) : (
                  <div style={{color: 'red', padding: '20px'}}>円グラフデータを読み込み中...</div>
                )}
              </div>

              <div className={styles.flexCol} style={{ flex: "1 1 280px" }}>
                <h3 style={{
                  margin: "0 0 16px 0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}>📊 詳細データ</h3>
                <table style={{ 
                  borderCollapse: "collapse", 
                  width: "100%",
                  border: "2px solid #e2e8f0",
                  background: "#fff", 
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ 
                        padding: "12px 16px", 
                        textAlign: "left", 
                        fontWeight: "bold",
                        color: "#1e293b",
                        fontSize: "18px"
                      }}>区分</th>
                      <th style={{ 
                        padding: "12px 16px", 
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#1e293b",
                        fontSize: "18px"
                      }}>データ数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((d, index) => (
                      <tr key={d.label} style={{
                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc"
                      }}>
                        <td style={{ 
                          padding: "10px 16px", 
                          color: "#374151", 
                          border: "1px solid #e5e7eb",
                          fontSize: "16px"
                        }}>{d.label}</td>
                        <td style={{ 
                          padding: "10px 16px", 
                          textAlign: "right",
                          color: "#374151", 
                          border: "1px solid #e5e7eb",
                          fontSize: "16px",
                          fontWeight: "500"
                        }}>{d.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ 
                flex: "1 1 320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <h3 style={{
                  margin: "0 0 16px 0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}>🤖 AI分析レポート</h3>
                <div style={{
                  width: "100%",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "2px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                  }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#475569"
                    }}>🔍 分析ステータス</div>
                    <button
                      onClick={generateAiComment}
                      disabled={isGeneratingComment}
                      style={{
                        padding: "10px 18px",
                        fontSize: "16px",
                        backgroundColor: isGeneratingComment ? "#94a3b8" : "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isGeneratingComment ? "not-allowed" : "pointer",
                        fontWeight: "500"
                      }}
                    >
                      {isGeneratingComment ? "分析中..." : "分析実行"}
                    </button>
                  </div>
                  
                  <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "18px",
                    minHeight: "250px",
                    border: "1px solid #e2e8f0",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: "#374151",
                    whiteSpace: "pre-wrap",
                    overflowY: "auto",
                    maxHeight: "320px"
                  }}>
                    {isGeneratingComment ? (
                      <div style={{ 
                        textAlign: "center", 
                        color: "#6b7280",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "200px"
                      }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}></div>
                        <div>AI分析中...</div>
                        <div style={{ fontSize: "12px", marginTop: "4px" }}>統計データを解析しています</div>
                      </div>
                    ) : aiComment ? (
                      <div>{aiComment}</div>
                    ) : (
                      <div style={{ 
                        textAlign: "center", 
                        color: "#94a3b8",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "200px"
                      }}>
                        <div style={{ fontSize: "32px", marginBottom: "12px" }}></div>
                        <div>AI分析を実行して詳細なレポートを生成</div>
                        <div style={{ fontSize: "12px", marginTop: "8px" }}>「分析実行」ボタンをクリック</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 下段: 折れ線グラフ + トレンド分析 */}
          <div className={styles.flexRow}>
            <div className={styles.card} style={{display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 30}}>
              <div className={styles.flexCol} style={{ flex: "0 0 auto", overflow: "visible", minWidth: "600px" }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}>📈 時系列トレンド</h3>
                {dates.length > 0 && lineData.length > 0 ? (
                  <div style={{ overflow: "visible", width: "100%", minWidth: "580px" }}>
                    <MultiLineChart dates={dates} lineData={lineData} width={580} height={390} />
                  </div>
                ) : (
                  <div style={{color: 'red', padding: '20px'}}>折れ線グラフデータを読み込み中...</div>
                )}
              </div>
              
              <div className={styles.flexCol} style={{ flex: "0 0 auto", width: "320px" }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}>📋 トレンド分析</h3>
                <div style={{
                  width: "100%",
                  backgroundColor: "#fefefe",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "2px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  height: "390px"
                }}>
                  <div style={{
                    backgroundColor: "#f9fafb",
                    borderRadius: "10px",
                    padding: "16px",
                    height: "350px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "#374151",
                    overflowY: "auto"
                  }}>
                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>📊 データ概要</h4>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                         期間: {dates[0]} ～ {dates[dates.length - 1]}<br/>
                         データ系列: {lineData.length}種類<br/>
                         観測点: {dates.length}ポイント
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}>📈 トレンド傾向</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {lineData.length > 0 ? (
                          <div>
                            主要感情: 喜・集が安定推移<br/>
                            注意感情: 疲・憂が微増傾向<br/>
                            全体: バランス良好
                          </div>
                        ) : (
                          <div>データを読み込み中...</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}>💡 改善提案</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                         定期的な観察継続<br/>
                         個別ケアの実施<br/>
                         予防的対応を重視
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 週間統計モーダル */}
      {showWeeklyStats && weeklyStatsData && (
        <WeeklyStats 
          emotionLabel={selectedEmotion}
          data={weeklyStatsData}
          onClose={closeWeeklyStats}
        />
      )}
    </DesktopFrame>
  );
}