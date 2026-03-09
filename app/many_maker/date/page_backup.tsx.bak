"use client";

import { useEffect, useState, useRef } from "react";
import DesktopFrame from "../../../components/frame/DesktopFrame";
import ToukeiPieChart from "../../../components/maker/toukei";
import MultiLineChart from "../../../components/maker/MultiLineChart";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Maker() {
  const [lineData, setLineData] = useState<any[]>([]);
  const [dates, setDates] = useState(["7/1", "7/2", "7/3", "7/4", "7/5", "7/6", "7/7"]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const fullReportRef = useRef<HTMLDivElement>(null);
  const [selectedSchool, setSelectedSchool] = useState("全校");
  const [aiComment, setAiComment] = useState("");
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);

  useEffect(() => {
    fetch("/chartData.json")
      .then((res) => res.json())
      .then((data) => {
        setLineData(data);
        setSampleData(data.map((d: any) => ({ label: d.label, value: d.values[d.values.length - 1] })));
      });
  }, []);

  const generateAiComment = async () => {
    setIsGeneratingComment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalValue = sampleData.reduce((sum, item) => sum + item.value, 0);
      const avgValue = totalValue / sampleData.length;
      const maxItem = sampleData.reduce((max, item) => item.value > max.value ? item : max);
      const minItem = sampleData.reduce((min, item) => item.value < min.value ? item : min);
      
      const comment = `【AI分析レポート】

 統計サマリー
総データ数: ${sampleData.length}項目
平均値: ${avgValue.toFixed(1)}
最高値: ${maxItem.label} (${maxItem.value})
最低値: ${minItem.label} (${minItem.value})

 分析結果
データ全体の傾向として、${maxItem.label}が最も高い数値を示しており、全体の${((maxItem.value / totalValue) * 100).toFixed(1)}%を占めています。一方、${minItem.label}は相対的に低い値となっており、改善の余地があることが示唆されます。

 提案事項
1. ${maxItem.label}の成功要因を他の項目にも応用することを検討
2. ${minItem.label}の改善施策の立案と実行
3. 平均値(${avgValue.toFixed(1)})を基準とした目標設定の見直し

この分析結果を基に、より効果的な教育戦略の策定にお役立てください。`;
      
      setAiComment(comment);
    } catch (error) {
      setAiComment('AIコメントの生成中にエラーが発生しました。再度お試しください。');
    } finally {
      setIsGeneratingComment(false);
    }
  };

  const exportToPDF = async () => {
    if (!fullReportRef.current) return;
    try {
      const canvas = await html2canvas(fullReportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: fullReportRef.current.scrollWidth,
        height: fullReportRef.current.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 複数ページに分割する場合の処理
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // 縦に長い場合は複数ページに分割
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
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
      const canvas = await html2canvas(fullReportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: fullReportRef.current.scrollWidth,
        height: fullReportRef.current.scrollHeight
      });
      
      const link = document.createElement('a');
      link.download = `統計レポート_${selectedSchool}_${new Date().toLocaleDateString()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('JPEG出力エラー:', error);
      alert('JPEG出力中にエラーが発生しました。');
    }
  };

  return (
    <DesktopFrame>
      <div style={{ 
        padding: '0px 24px 8px 24px', 
        minHeight: "110dvh", 
        height: "110dvh", 
        overflowY: "auto", 
        boxSizing: "border-box"
      }}>
        <h1>統計データダッシュボード</h1>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: 32,
          padding: "20px 0",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <select 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="全校"> 全校</option>
            <option value="小学校"> 小学校</option>
            <option value="中学校"> 中学校</option>
            <option value="高等学校"> 高等学校</option>
          </select>
          
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={exportToPDF} style={{
              padding: "10px 20px",
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
               PDF出力
            </button>
            <button onClick={exportToJPEG} style={{
              padding: "10px 20px",
              backgroundColor: "#059669",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
               JPEG出力
            </button>
          </div>
        </div>

        {/* 全体レポート（円グラフ + 分析データ + 折れ線グラフ）をPDF/JPEG保存用にref適用 */}
        <div ref={fullReportRef} style={{ backgroundColor: "#fff", padding: "20px", margin: "0 20px" }}>
          {/* 上段: 円グラフとサマリー */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "flex-start", 
            marginBottom: 48,
            padding: "0 20px"
          }}>
            <div ref={tableRef} style={{
              display: "flex", 
              alignItems: "flex-start", 
              justifyContent: "space-between",
              gap: 40, 
              backgroundColor: "#fff",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #f1f5f9",
              maxWidth: "1200px",
              width: "100%"
            }}>
            <div style={{ 
              flex: "1 1 320px", 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}> データ分布</h3>
              <ToukeiPieChart data={sampleData} size={320} />
            </div>

            <div style={{ 
              flex: "1 1 280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}> 詳細データ</h3>
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
                      fontSize: "14px"
                    }}>区分</th>
                    <th style={{ 
                      padding: "12px 16px", 
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "#1e293b",
                      fontSize: "14px"
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
                        fontSize: "13px"
                      }}>{d.label}</td>
                      <td style={{ 
                        padding: "10px 16px", 
                        textAlign: "right",
                        color: "#374151", 
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
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
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}> AI分析レポート</h3>
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
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#475569"
                  }}> 分析ステータス</div>
                  <button
                    onClick={generateAiComment}
                    disabled={isGeneratingComment}
                    style={{
                      padding: "8px 16px",
                      fontSize: "12px",
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
                  fontSize: "13px",
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

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-start", 
          padding: "0 20px",
          marginTop: 48
        }}>
          <div style={{
            display: "flex", 
            alignItems: "flex-start", 
            gap: 32,
            backgroundColor: "#fff",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #f1f5f9",
            maxWidth: "1200px",
            width: "100%"
          }}>
            <div style={{ 
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}> 時系列トレンド</h3>
              <MultiLineChart dates={dates} lineData={lineData} width={720} height={390} />
            </div>
            
            <div style={{ 
              flex: "0 0 auto", 
              width: "320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}> トレンド分析</h3>
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
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#374151",
                  overflowY: "auto"
                }}>
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> データ概要</h4>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                       期間: {dates[0]} ～ {dates[dates.length - 1]}<br/>
                       データ系列: {lineData.length}種類<br/>
                       観測点: {dates.length}ポイント
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> 主要トレンド</h4>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {lineData.length > 0 ? (
                        lineData.map((item, index) => {
                          const values = item.values || [];
                          const trend = values.length >= 2 ? 
                            (values[values.length - 1] > values[0] ? " 上昇傾向" : 
                             values[values.length - 1] < values[0] ? " 下降傾向" : " 安定推移") : " 安定推移";
                          return (
                            <div key={index} style={{ marginBottom: "6px" }}>
                              <strong>{item.label}:</strong> {trend}
                            </div>
                          );
                        })
                      ) : (
                        <div>データを読み込み中...</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> 改善提案</h4>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                       定期的なデータ監視体制の構築<br/>
                       トレンド変化の早期発見システム<br/>
                       予測モデルの活用検討<br/>
                       データドリブンな意思決定の促進
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 下段: 折れ線グラフ + トレンド分析 */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "flex-start", 
            marginBottom: 48,
            padding: "0 20px"
          }}>
            <div style={{
              display: "flex", 
              alignItems: "flex-start", 
              justifyContent: "space-between",
              gap: 40, 
              backgroundColor: "#fff",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #f1f5f9",
              maxWidth: "1200px",
              width: "100%"
            }}>
              <div style={{ 
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}> 時系列トレンド</h3>
                <MultiLineChart dates={dates} lineData={lineData} width={720} height={390} />
              </div>
              
              <div style={{ 
                flex: "0 0 auto", 
                width: "320px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1e293b",
                  textAlign: "center"
                }}> トレンド分析</h3>
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
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "#374151",
                    overflowY: "auto"
                  }}>
                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> データ概要</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                         期間: {dates[0]} ～ {dates[dates.length - 1]}<br/>
                         データ系列: {lineData.length}種類<br/>
                         観測点: {dates.length}ポイント
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "16px" }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> トレンド傾向</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {lineData.length > 0 ? (
                          lineData.map((series, index) => (
                            <div key={index} style={{ marginBottom: "4px" }}>
                               {series.name}: {series.trend || "分析中"}
                            </div>
                          ))
                        ) : (
                          <div>データを読み込み中...</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}> 改善提案</h4>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                         定期的なデータ監視体制の構築<br/>
                         トレンド変化の早期発見システム<br/>
                         予測モデルの活用検討<br/>
                         データドリブンな意思決定の促進
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}
