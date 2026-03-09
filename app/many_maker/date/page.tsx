"use client";

import { useState, useEffect, useRef } from "react";
import EducationBoardFrame from "../../../components/frame/EducationBoardFrame";
import ToukeiPieChart from "../../../components/maker/toukei";
import MultiLineChart from "../../../components/maker/MultiLineChart";
import WeeklyStats from "../../../components/maker/WeeklyStats";
import type { WeeklyStatsData } from "../../../types/toukei";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export default function DatePage() {
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [schoolsData, setSchoolsData] = useState<SchoolData[]>([]);
  const [sampleData, setSampleData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [aiComment, setAiComment] = useState<string>("");
  const [isGeneratingComment, setIsGeneratingComment] = useState<boolean>(false);
  const [showWeeklyStats, setShowWeeklyStats] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [weeklyStatsData, setWeeklyStatsData] = useState<WeeklyStatsData | null>(null);
  
  // 時期指定用のstate
  const [dateRangeType, setDateRangeType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [specificDateTime, setSpecificDateTime] = useState<string>("");
  
  const tableRef = useRef<HTMLDivElement>(null);
  const fullReportRef = useRef<HTMLDivElement>(null);

  // 時期指定に応じてデータを取得・フィルタリング
  const fetchDataByDateRange = async () => {
    try {
      let filteredData;
      const currentDate = new Date();
      
      switch (dateRangeType) {
        case "daily":
          if (specificDateTime) {
            filteredData = await fetchDailyData(specificDateTime);
          } else {
            filteredData = await fetchDailyData(currentDate.toISOString().split('T')[0]);
          }
          break;
        case "weekly":
          if (selectedWeek) {
            filteredData = await fetchWeeklyData(selectedWeek);
          } else {
            filteredData = await fetchCurrentWeekData();
          }
          break;
        case "monthly":
          if (selectedMonth) {
            filteredData = await fetchMonthlyData(selectedMonth);
          } else {
            filteredData = await fetchMonthlyData(currentDate.toISOString().substring(0, 7));
          }
          break;
        case "custom":
          if (startDate && endDate) {
            filteredData = await fetchCustomRangeData(startDate, endDate);
          }
          break;
        default:
          filteredData = await fetchDefaultData();
      }
      
      if (filteredData) {
        setSampleData(filteredData.pieData);
        setLineData(filteredData.lineData);
        setDates(filteredData.dates);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  // 各種データ取得関数
  const fetchDailyData = async (date: string) => {
    console.log('日別データ取得:', date);
    return generateSampleDataForDate(date);
  };

  const fetchWeeklyData = async (week: string) => {
    console.log('週別データ取得:', week);
    return generateSampleDataForWeek(week);
  };

  const fetchMonthlyData = async (month: string) => {
    console.log('月別データ取得:', month);
    return generateSampleDataForMonth(month);
  };

  const fetchCustomRangeData = async (start: string, end: string) => {
    console.log('期間指定データ取得:', start, 'から', end);
    return generateSampleDataForRange(start, end);
  };

  const fetchCurrentWeekData = async () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return generateSampleDataForWeek(weekStart.toISOString().split('T')[0]);
  };

  const fetchDefaultData = async () => {
    return {
      pieData: [
        { label: "喜", value: 85, color: "#22c55e" },
        { label: "哀", value: 35, color: "#3b82f6" },
        { label: "怒", value: 25, color: "#ef4444" },
        { label: "憂", value: 45, color: "#f59e0b" },
        { label: "疲", value: 60, color: "#8b5cf6" },
        { label: "集", value: 70, color: "#06b6d4" },
        { label: "困", value: 30, color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: [70, 75, 80, 85, 88, 90, 85] },
        { label: "哀", values: [40, 38, 36, 35, 33, 30, 35] },
        { label: "怒", values: [30, 28, 25, 23, 22, 20, 25] },
        { label: "憂", values: [50, 48, 45, 43, 40, 38, 45] },
        { label: "疲", values: [65, 63, 60, 58, 55, 52, 60] },
        { label: "集", values: [60, 65, 68, 70, 72, 75, 70] },
        { label: "困", values: [35, 33, 30, 28, 25, 23, 30] }
      ],
      dates: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07"]
    };
  };

  // サンプルデータ生成関数群
  const generateSampleDataForDate = (date: string) => {
    const baseValues = [85, 35, 25, 45, 60, 70, 30];
    const variation = Math.sin(new Date(date).getTime() / 86400000) * 10;
    
    return {
      pieData: [
        { label: "喜", value: Math.max(0, baseValues[0] + variation), color: "#22c55e" },
        { label: "哀", value: Math.max(0, baseValues[1] - variation), color: "#3b82f6" },
        { label: "怒", value: Math.max(0, baseValues[2] + variation/2), color: "#ef4444" },
        { label: "憂", value: Math.max(0, baseValues[3] - variation/2), color: "#f59e0b" },
        { label: "疲", value: Math.max(0, baseValues[4] + variation/3), color: "#8b5cf6" },
        { label: "集", value: Math.max(0, baseValues[5] - variation/3), color: "#06b6d4" },
        { label: "困", value: Math.max(0, baseValues[6] + variation/4), color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: [70, 75, 80, 85, 88, 90, 85].map(v => v + variation) },
        { label: "哀", values: [40, 38, 36, 35, 33, 30, 35].map(v => v - variation) }
      ],
      dates: [date]
    };
  };

  const generateSampleDataForWeek = (weekStart: string) => {
    const weekDates = [];
    const startDate = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    return {
      pieData: [
        { label: "喜", value: 78, color: "#22c55e" },
        { label: "哀", value: 42, color: "#3b82f6" },
        { label: "怒", value: 28, color: "#ef4444" },
        { label: "憂", value: 38, color: "#f59e0b" },
        { label: "疲", value: 55, color: "#8b5cf6" },
        { label: "集", value: 68, color: "#06b6d4" },
        { label: "困", value: 35, color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: weekDates.map(() => 70 + Math.random() * 20) },
        { label: "哀", values: weekDates.map(() => 30 + Math.random() * 20) }
      ],
      dates: weekDates
    };
  };

  const generateSampleDataForMonth = (month: string) => {
    const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const monthDates = [];
    for (let i = 1; i <= Math.min(daysInMonth, 30); i++) {
      monthDates.push(`${month}-${String(i).padStart(2, '0')}`);
    }
    
    return {
      pieData: [
        { label: "喜", value: 82, color: "#22c55e" },
        { label: "哀", value: 38, color: "#3b82f6" },
        { label: "怒", value: 22, color: "#ef4444" },
        { label: "憂", value: 35, color: "#f59e0b" },
        { label: "疲", value: 48, color: "#8b5cf6" },
        { label: "集", value: 75, color: "#06b6d4" },
        { label: "困", value: 28, color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: monthDates.map((_, i) => 75 + Math.sin(i/7) * 15) },
        { label: "哀", values: monthDates.map((_, i) => 35 + Math.cos(i/7) * 10) }
      ],
      dates: monthDates.slice(0, 7)
    };
  };

  const generateSampleDataForRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const rangeDates = [];
    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      rangeDates.push(date.toISOString().split('T')[0]);
    }
    
    return {
      pieData: [
        { label: "喜", value: 76, color: "#22c55e" },
        { label: "哀", value: 40, color: "#3b82f6" },
        { label: "怒", value: 30, color: "#ef4444" },
        { label: "憂", value: 42, color: "#f59e0b" },
        { label: "疲", value: 58, color: "#8b5cf6" },
        { label: "集", value: 65, color: "#06b6d4" },
        { label: "困", value: 33, color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: rangeDates.slice(0, 7).map(() => 70 + Math.random() * 25) },
        { label: "哀", values: rangeDates.slice(0, 7).map(() => 35 + Math.random() * 15) }
      ],
      dates: rangeDates.slice(0, 7)
    };
  };

  // 時期指定タイプ変更ハンドラ
  const handleDateRangeTypeChange = (type: "daily" | "weekly" | "monthly" | "custom") => {
    setDateRangeType(type);
    setStartDate("");
    setEndDate("");
    setSelectedMonth("");
    setSelectedWeek("");
    setSpecificDateTime("");
  };

  // useEffectにデータ取得を追加
  useEffect(() => {
    fetchDataByDateRange();
  }, [dateRangeType, specificDateTime, selectedWeek, selectedMonth, startDate, endDate]);

  useEffect(() => {
    // 学校データを取得
    const fetchSchoolsData = async () => {
      try {
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
      } catch (error) {
        console.error("学校データ取得エラー:", error);
      }
    };

    fetchSchoolsData();
  }, []);

  // 初期データ取得用useEffect
  useEffect(() => {
    const loadInitialData = () => {
      fetch("/chartData.json")
        .then(res => res.json())
        .then(data => {
          console.log('Loaded initial data:', data);
          if (!specificDateTime && !selectedWeek && !selectedMonth && !startDate && !endDate) {
            setSampleData(data.pieData || []);
            setDates(data.dates || []);
            setLineData(data.lineData || []);
          }
        })
        .catch(error => {
          console.error("初期データ読み込みエラー:", error);
          if (!specificDateTime && !selectedWeek && !selectedMonth && !startDate && !endDate) {
            loadDefaultData();
          }
        });
    };

    loadInitialData();
  }, []);

  // デフォルトデータをロード
  const loadDefaultData = () => {
    setSampleData([
      { label: "喜", value: 85, color: "#22c55e" },
      { label: "哀", value: 35, color: "#3b82f6" },
      { label: "怒", value: 25, color: "#ef4444" },
      { label: "憂", value: 45, color: "#f59e0b" },
      { label: "疲", value: 60, color: "#8b5cf6" },
      { label: "集", value: 70, color: "#06b6d4" },
      { label: "困", value: 30, color: "#ec4899" }
    ]);
    setDates(["2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07"]);
    setLineData([
      { label: "喜", values: [70, 75, 80, 85, 88, 90, 85] },
      { label: "哀", values: [40, 38, 36, 35, 33, 30, 35] },
      { label: "怒", values: [30, 28, 25, 23, 22, 20, 25] },
      { label: "憂", values: [50, 48, 45, 43, 40, 38, 45] },
      { label: "疲", values: [65, 63, 60, 58, 55, 52, 60] },
      { label: "集", values: [60, 65, 68, 70, 72, 75, 70] },
      { label: "困", values: [35, 33, 30, 28, 25, 23, 30] }
    ]);
  };

  // 特定学校のデータをロード
  const loadSchoolSpecificData = (schoolName: string) => {
    const schoolData = generateSchoolData(schoolName);
    setSampleData(schoolData.pieData);
    setLineData(schoolData.lineData);
  };

  // 全学校の統合データを生成
  const generateAggregatedData = () => {
    setSampleData([
      { label: "喜", value: 78, color: "#22c55e" },
      { label: "哀", value: 42, color: "#3b82f6" },
      { label: "怒", value: 28, color: "#ef4444" },
      { label: "憂", value: 38, color: "#f59e0b" },
      { label: "疲", value: 55, color: "#8b5cf6" },
      { label: "集", value: 68, color: "#06b6d4" },
      { label: "困", value: 35, color: "#ec4899" }
    ]);
    setLineData([
      { label: "喜", values: [72, 74, 76, 78, 80, 82, 78] },
      { label: "哀", values: [45, 44, 43, 42, 41, 40, 42] },
      { label: "怒", values: [32, 31, 30, 28, 27, 26, 28] },
      { label: "憂", values: [42, 41, 40, 38, 37, 36, 38] },
      { label: "疲", values: [58, 57, 56, 55, 54, 53, 55] },
      { label: "集", values: [65, 66, 67, 68, 69, 70, 68] },
      { label: "困", values: [38, 37, 36, 35, 34, 33, 35] }
    ]);
  };

  // 学校別データ生成
  const generateSchoolData = (schoolName: string) => {
    const baseData: Record<string, any> = {
      "都立桜台高等学校": {
        pieData: [
          { label: "喜", value: 72, color: "#22c55e" },
          { label: "哀", value: 48, color: "#3b82f6" },
          { label: "怒", value: 35, color: "#ef4444" },
          { label: "憂", value: 42, color: "#f59e0b" },
          { label: "疲", value: 65, color: "#8b5cf6" },
          { label: "集", value: 58, color: "#06b6d4" },
          { label: "困", value: 38, color: "#ec4899" }
        ],
        lineData: [
          { label: "喜", values: [65, 68, 70, 72, 74, 76, 72] },
          { label: "哀", values: [50, 49, 48, 47, 46, 45, 48] },
          { label: "怒", values: [40, 38, 37, 35, 34, 32, 35] },
          { label: "憂", values: [45, 44, 43, 42, 41, 40, 42] },
          { label: "疲", values: [70, 68, 67, 65, 64, 62, 65] },
          { label: "集", values: [55, 56, 57, 58, 59, 60, 58] },
          { label: "困", values: [42, 40, 39, 38, 37, 35, 38] }
        ]
      },
      "都立新宿高等学校": {
        pieData: [
          { label: "喜", value: 82, color: "#22c55e" },
          { label: "哀", value: 32, color: "#3b82f6" },
          { label: "怒", value: 22, color: "#ef4444" },
          { label: "憂", value: 35, color: "#f59e0b" },
          { label: "疲", value: 48, color: "#8b5cf6" },
          { label: "集", value: 75, color: "#06b6d4" },
          { label: "困", value: 28, color: "#ec4899" }
        ],
        lineData: [
          { label: "喜", values: [78, 79, 80, 82, 84, 85, 82] },
          { label: "哀", values: [35, 34, 33, 32, 31, 30, 32] },
          { label: "怒", values: [25, 24, 23, 22, 21, 20, 22] },
          { label: "憂", values: [38, 37, 36, 35, 34, 33, 35] },
          { label: "疲", values: [52, 50, 49, 48, 47, 45, 48] },
          { label: "集", values: [72, 73, 74, 75, 76, 77, 75] },
          { label: "困", values: [32, 31, 30, 28, 27, 25, 28] }
        ]
      }
    };

    return baseData[schoolName] || {
      pieData: [
        { label: "喜", value: 75, color: "#22c55e" },
        { label: "哀", value: 40, color: "#3b82f6" },
        { label: "怒", value: 30, color: "#ef4444" },
        { label: "憂", value: 45, color: "#f59e0b" },
        { label: "疲", value: 58, color: "#8b5cf6" },
        { label: "集", value: 65, color: "#06b6d4" },
        { label: "困", value: 32, color: "#ec4899" }
      ],
      lineData: [
        { label: "喜", values: [70, 72, 74, 75, 76, 78, 75] },
        { label: "哀", values: [42, 41, 40, 39, 38, 37, 40] },
        { label: "怒", values: [33, 32, 31, 30, 29, 28, 30] },
        { label: "憂", values: [48, 47, 46, 45, 44, 43, 45] },
        { label: "疲", values: [62, 60, 59, 58, 57, 55, 58] },
        { label: "集", values: [62, 63, 64, 65, 66, 67, 65] },
        { label: "困", values: [35, 34, 33, 32, 31, 30, 32] }
      ]
    };
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedSchool(selectedValue);
    
    if (selectedValue === "all_schools") {
      generateAggregatedData();
    } else if (selectedValue === "") {
      loadDefaultData();
    } else {
      loadSchoolSpecificData(selectedValue);
    }
  };

  const handlePieSegmentClick = (label: string) => {
    console.log('Clicked segment:', label);
    setSelectedEmotion(label);
    // 仮のデータでsegment情報を作成
    const segment = sampleData.find(data => data.label === label) || { label, value: 50, color: '#ccc' };
    
    const weeklyData: WeeklyStatsData = {
      weekDays: ['月', '火', '水', '木', '金', '土', '日'],
      values: [
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
        segment.value + Math.random() * 10 - 5,
      ],
      totalCount: segment.value * 7,
      average: segment.value,
      trend: Math.random() > 0.5 ? '上昇' : '下降',
    };
    setWeeklyStatsData(weeklyData);
    setShowWeeklyStats(true);
  };

  const closeWeeklyStats = () => {
    setShowWeeklyStats(false);
    setWeeklyStatsData(null);
    setSelectedEmotion("");
  };

  const generateComment = async () => {
    setIsGeneratingComment(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const comments = [
        "データ分析の結果、生徒の感情状態は概ね良好です。「喜」の割合が高く、学習環境が適切に維持されています。",
        "「疲」の数値がやや高めです。学習負荷の調整や休息時間の確保を検討することをお勧めします。",
        "感情バランスが安定しており、教育指導が効果的に行われています。この状態の維持に努めてください。",
        "「集」の数値向上が見られます。集中力を高める取り組みの効果が現れていると考えられます。"
      ];
      
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      setAiComment(randomComment);
    } catch (error) {
      console.error('コメント生成エラー:', error);
      setAiComment("申し訳ありませんが、コメントの生成に失敗しました。");
    } finally {
      setIsGeneratingComment(false);
    }
  };

  const exportToPDF = async () => {
    if (fullReportRef.current) {
      try {
        const canvas = await html2canvas(fullReportRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          height: fullReportRef.current.scrollHeight,
          width: fullReportRef.current.scrollWidth
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save('統計レポート.pdf');
      } catch (error) {
        console.error('PDF出力エラー:', error);
        alert('PDF出力中にエラーが発生しました。');
      }
    }
  };

  const exportToJPEG = async () => {
    if (fullReportRef.current) {
      try {
        const canvas = await html2canvas(fullReportRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          height: fullReportRef.current.scrollHeight,
          width: fullReportRef.current.scrollWidth
        });

        const link = document.createElement('a');
        link.download = '統計レポート.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.8);
        link.click();
      } catch (error) {
        console.error('JPEG出力エラー:', error);
        alert('JPEG出力中にエラーが発生しました。');
      }
    }
  };

  return (
    <EducationBoardFrame>
      <div style={{ 
        padding: '0px 24px 8px 24px', 
        minHeight: "110dvh", 
        height: "110dvh", 
        overflowY: "auto", 
        boxSizing: "border-box"
      }}>
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
          📊 統計データ分析
        </h1>

        {/* 時期指定セクション */}
        <div style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "24px",
          marginLeft: "2cm",
          marginRight: "20px",
          border: "2px solid #cbd5e1",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            📅 データ取得期間設定
          </h3>
          
          <div style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "16px"
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {[
                { type: "daily", label: "📅 日別", icon: "📅" },
                { type: "weekly", label: "📊 週別", icon: "📊" },
                { type: "monthly", label: "📈 月別", icon: "📈" },
                { type: "custom", label: "🎯 期間指定", icon: "🎯" }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handleDateRangeTypeChange(type as any)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: dateRangeType === type ? "2px solid #3b82f6" : "2px solid #d1d5db",
                    backgroundColor: dateRangeType === type ? "#dbeafe" : "#fff",
                    color: dateRangeType === type ? "#1e40af" : "#4b5563",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            {dateRangeType === "daily" && (
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#4b5563"
                }}>
                  📅 特定日時選択
                </label>
                <input
                  type="datetime-local"
                  value={specificDateTime}
                  onChange={(e) => setSpecificDateTime(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    minWidth: "200px"
                  }}
                />
              </div>
            )}

            {dateRangeType === "weekly" && (
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#4b5563"
                }}>
                  📊 週の開始日
                </label>
                <input
                  type="date"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    minWidth: "150px"
                  }}
                />
              </div>
            )}

            {dateRangeType === "monthly" && (
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#4b5563"
                }}>
                  📈 対象月
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    minWidth: "150px"
                  }}
                />
              </div>
            )}

            {dateRangeType === "custom" && (
              <>
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#4b5563"
                  }}>
                    🎯 開始日
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      minWidth: "150px"
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#4b5563"
                  }}>
                    🏁 終了日
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      minWidth: "150px"
                    }}
                  />
                </div>
              </>
            )}

            <div style={{
              padding: "8px 12px",
              backgroundColor: "#f0f9ff",
              borderRadius: "6px",
              border: "1px solid #0ea5e9",
              fontSize: "12px",
              color: "#0369a1",
              fontWeight: "500"
            }}>
              {dateRangeType === "daily" && specificDateTime && `📅 ${new Date(specificDateTime).toLocaleDateString('ja-JP')} ${new Date(specificDateTime).toLocaleTimeString('ja-JP')}`}
              {dateRangeType === "daily" && !specificDateTime && "📅 今日のデータ"}
              {dateRangeType === "weekly" && selectedWeek && `📊 ${selectedWeek}の週`}
              {dateRangeType === "weekly" && !selectedWeek && "📊 今週のデータ"}
              {dateRangeType === "monthly" && selectedMonth && `📈 ${selectedMonth.replace('-', '年') + '月'}`}
              {dateRangeType === "monthly" && !selectedMonth && "📈 今月のデータ"}
              {dateRangeType === "custom" && startDate && endDate && `🎯 ${startDate} ～ ${endDate}`}
              {dateRangeType === "custom" && (!startDate || !endDate) && "🎯 期間を設定してください"}
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          marginTop: "8px",
          padding: "0 20px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <select 
              value={selectedSchool} 
              onChange={handleSchoolChange}
              style={{
                padding: "12px 20px",
                fontSize: "18px",
                borderRadius: "8px",
                border: "2px solid #d1d5db",
                backgroundColor: "#fff",
                minWidth: "220px"
              }}
            >
              <option value="">学校を選択</option>
              <option value="all_schools">🏫 管轄内学校全部</option>
              {schoolsData.map((school) => (
                <option key={school.id} value={school.name}>
                  {school.name} ({school.district})
                </option>
              ))}
            </select>
            {selectedSchool && (
              <div style={{ 
                fontSize: "12px", 
                color: "#6b7280", 
                fontWeight: "500",
                textAlign: "right" 
              }}>
                {selectedSchool === "all_schools" 
                  ? `📊 管轄内全学校 (${schoolsData.length}校の統合データ)`
                  : `📈 ${selectedSchool}の個別データ表示中`}
              </div>
            )}
          </div>
          
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
              backgroundColor: "#16a34a",
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

        <div ref={fullReportRef} style={{ width: "100%" }}>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap",
            gap: "32px", 
            marginBottom: "40px",
            padding: "0 20px"
          }}>
            <div style={{ 
              flex: "1 1 280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#fff",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                  📊
                </div>
                <h3 style={{
                  margin: "0",
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#1e293b"
                }}>感情分布</h3>
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

            <div style={{ 
              flex: "1 1 280px",
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
              }}>📊 詳細データ</h3>
              <table style={{ 
                borderCollapse: "collapse", 
                width: "100%",
                border: "2px solid #e2e8f0",
                background: "#fff", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>感情</th>
                    <th style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>数値</th>
                    <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>割合</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px", fontWeight: "500", color: item.color }}>{item.label}</td>
                      <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold" }}>{item.value.toFixed(1)}</td>
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <div style={{ 
                          background: `linear-gradient(90deg, ${item.color}20, ${item.color}10)`,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          border: `1px solid ${item.color}40`
                        }}>
                          {((item.value / sampleData.reduce((sum, data) => sum + data.value, 0)) * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div ref={tableRef} style={{ 
            display: "flex", 
            flexWrap: "wrap",
            gap: "40px",
            padding: "0 20px",
            alignItems: "flex-start"
          }}>
            <div style={{ 
              flex: "1 1 580px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "visible",
              minWidth: "600px"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "22px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}>時系列トレンド</h3>
              {dates.length > 0 && lineData.length > 0 ? (
                <div style={{ overflow: "visible", width: "100%", minWidth: "580px" }}>
                  <MultiLineChart dates={dates} lineData={lineData} width={580} height={390} />
                </div>
              ) : (
                <div style={{color: 'red', padding: '20px'}}>折れ線グラフデータを読み込み中...</div>
              )}
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
                fontSize: "22px",
                fontWeight: "bold",
                color: "#1e293b",
                textAlign: "center"
              }}>トレンド分析</h3>
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
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#1f2937" }}>データ概要</h4>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      期間: {dates[0]} ～ {dates[dates.length - 1]}<br/>
                      データ系列: {lineData.length}種類<br/>
                      観測点: {dates.length}ポイント
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#1f2937" }}>トレンド傾向</h4>
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
      
      {/* 週間統計モーダル */}
      {showWeeklyStats && weeklyStatsData && (
        <WeeklyStats 
          emotionLabel={selectedEmotion}
          data={weeklyStatsData}
          onClose={closeWeeklyStats}
        />
      )}
    </EducationBoardFrame>
  );
}