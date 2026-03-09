import React from "react";

// 折れ線グラフ用データ型
export type LineData = {
  date: string; // 日付（横軸）
  value: number; // データ数（縦軸）
};

export type ToukeiLineChartProps = {
  data: LineData[];
  width?: number;
  height?: number;
};

const ToukeiLineChart: React.FC<ToukeiLineChartProps> = ({ data, width = 480, height = 200 }) => {
  if (data.length === 0) return null;
  // 軸の範囲計算
  const minY = 0;
  const maxY = Math.max(...data.map(d => d.value));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  // X座標計算
  const xStep = chartWidth / (data.length - 1);
  // Y座標計算
  const getY = (v: number) => chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

  return (
    <svg width={width} height={height} style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
      {/* 軸 */}
      <g>
        <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#333" strokeWidth={2} />
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#333" strokeWidth={2} />
      </g>
      {/* 折れ線 */}
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        points={data.map((d, i) => `${padding + i * xStep},${padding + getY(d.value)}`).join(' ')}
      />
      {/* 点とラベル */}
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={padding + i * xStep} cy={padding + getY(d.value)} r={5} fill="#3b82f6" />
          <text x={padding + i * xStep} y={height-padding+18} textAnchor="middle" fontSize={14} fill="#333">{d.date}</text>
          <text x={padding + i * xStep} y={padding + getY(d.value) - 10} textAnchor="middle" fontSize={13} fill="#222">{d.value}</text>
        </g>
      ))}
    </svg>
  );
};

export default ToukeiLineChart;
