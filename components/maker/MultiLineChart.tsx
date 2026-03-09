import React from "react";

type MultiLineChartProps = {
  dates: string[];
  lineData: { label: string; values: number[] }[];
  width?: number;
  height?: number;
};

const colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#14b8a6"];

const MultiLineChart: React.FC<MultiLineChartProps> = ({ dates, lineData, width = 480, height = 260 }) => {
  // データ検証
  if (!lineData || !Array.isArray(lineData) || lineData.length === 0) {
    console.warn('MultiLineChart: lineData is invalid or empty');
    return <div style={{padding: '20px', color: '#666'}}>グラフデータが不正です</div>;
  }
  
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    console.warn('MultiLineChart: dates is invalid or empty');
    return <div style={{padding: '20px', color: '#666'}}>日付データが不正です</div>;
  }

  const padding = 60;
  height = 460;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  // 数値データの検証と修正
  const validLineData = lineData.map(d => ({
    ...d,
    values: Array.isArray(d.values) 
      ? d.values.map(v => {
          const numValue = Number(v);
          return isNaN(numValue) ? 0 : numValue;
        })
      : []
  })).filter(d => d.values.length > 0);
  
  if (validLineData.length === 0) {
    console.warn('MultiLineChart: No valid data after filtering');
    return <div style={{padding: '20px', color: '#666'}}>有効なデータがありません</div>;
  }
  
  // Y軸の最大値・最小値の安全な計算
  const allValues = validLineData.flatMap(d => d.values);
  const maxY = Math.max(...allValues) || 100;
  const minY = Math.min(...allValues) || 0;
  
  // X座標計算（安全性チェック）
  const xStep = dates.length > 1 ? chartWidth / (dates.length - 1) : 0;
  
  // Y座標計算（安全性チェック）
  const getY = (v: number) => {
    const numV = Number(v);
    if (isNaN(numV) || maxY === minY) {
      return height - padding; // デフォルト位置
    }
    return padding + chartHeight - ((numV - minY) / (maxY - minY)) * chartHeight;
  };

  return (
    <svg width={width} height={height} style={{background: '#fafafa', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
      {/* 背景グリッド */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="url(#grid)" />
      
      {/* 軸 */}
      <g>
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#374151" strokeWidth={2} />
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#374151" strokeWidth={2} />
        
        {/* Y軸の目盛り */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = padding + chartHeight * ratio;
          const value = Math.round(maxY - (maxY - minY) * ratio);
          return (
            <g key={ratio}>
              <line x1={padding-5} y1={y} x2={padding+5} y2={y} stroke="#6b7280" strokeWidth={1} />
              <text x={padding-10} y={y+4} textAnchor="end" fontSize={12} fill="#6b7280">{value}</text>
            </g>
          );
        })}
      </g>
      {/* 折れ線（複数） */}
      {validLineData.map((d, idx) => {
        // ポイント配列の安全な生成
        const points = d.values.map((v, i) => {
          const x = padding + i * xStep;
          const y = getY(v);
          // NaN値チェック
          if (isNaN(x) || isNaN(y)) {
            console.warn(`Invalid point detected: x=${x}, y=${y}, value=${v}, index=${i}`);
            return null;
          }
          return `${x},${y}`;
        }).filter(point => point !== null).join(' ');
        
        if (!points) return null;
        
        return (
          <polyline
            key={d.label || `line-${idx}`}
            fill="none"
            stroke={colors[idx % colors.length]}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        );
      })}
      {/* 点とラベル */}
      {validLineData.map((d, idx) =>
        d.values.map((v, i) => {
          const x = padding + i * xStep;
          const y = getY(v);
          const numV = Number(v);
          
          // NaN値チェック
          if (isNaN(x) || isNaN(y) || isNaN(numV)) {
            console.warn(`Skipping invalid point: x=${x}, y=${y}, value=${v}`);
            return null;
          }
          
          // 日付データの安全性チェック
          const dateLabel = dates[i] || `Day ${i + 1}`;
          
          return (
            <g key={`${d.label || `series-${idx}`}-${i}`}>
              <circle 
                cx={x} 
                cy={y} 
                r={6} 
                fill="white"
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
              />
              <circle 
                cx={x} 
                cy={y} 
                r={3} 
                fill={colors[idx % colors.length]} 
              />
              {i === 0 && (
                <text 
                  x={padding - 15} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize={14} 
                  fill={colors[idx % colors.length]} 
                  fontWeight="600"
                >
                  {d.label || `系列${idx + 1}`}
                </text>
              )}
              <text 
                x={x} 
                y={height - padding + 20} 
                textAnchor="middle" 
                fontSize={12} 
                fill="#4b5563"
              >
                {dateLabel}
              </text>
              <text 
                x={x} 
                y={y - 15} 
                textAnchor="middle" 
                fontSize={12} 
                fill="#1f2937"
                fontWeight="500"
              >
                {numV.toFixed(1)}
              </text>
            </g>
          );
        }).filter(element => element !== null)
      )}
      {/* グラフタイトル */}
      <text x={width/2} y={25} textAnchor="middle" fontSize={16} fill="#1f2937" fontWeight="600">時系列推移</text>
    </svg>
  );
};

export default MultiLineChart;
