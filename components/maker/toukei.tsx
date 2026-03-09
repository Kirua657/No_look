import React from "react";
import type { PieData, ToukeiPieChartProps } from "../../types/toukei";

interface ToukeiPieChartWithClickProps extends ToukeiPieChartProps {
  onSegmentClick?: (label: string) => void;
}

const ToukeiPieChart: React.FC<ToukeiPieChartWithClickProps> = ({ 
  data, 
  size = 480, 
  onSegmentClick 
}) => {
  // データをvalueの降順（大きい順）にソート
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  // 合計値
  const total = sortedData.reduce((sum, d) => sum + d.value, 0);
  // 円グラフの各セグメントの開始・終了角度を計算
  // 90°（上方向）からスタート
  let startAngle = -Math.PI / 2;
  const colors = [
    "#22c55e", // 楽しい - 緑
    "#3b82f6", // 悲しい - 青
    "#ef4444", // 怒り - 赤
    "#f59e0b", // 不安 - オレンジ
    "#8b5cf6", // しんどい - 紫
    "#06b6d4", // 中立 - シアン
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size/2},${size/2})`}>
        {sortedData.map((d, i) => {
          const angle = (d.value / total) * 2 * Math.PI;
          const endAngle = startAngle + angle;
          // 円弧の座標計算
          const radius = size/2 - 10;
          const x1 = radius * Math.cos(startAngle);
          const y1 = radius * Math.sin(startAngle);
          const x2 = radius * Math.cos(endAngle);
          const y2 = radius * Math.sin(endAngle);
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          // セグメントの中央角度
          const midAngle = startAngle + angle / 2;
          const labelRadius = radius * 0.6; // 円の中心からラベルまでの距離
          const labelX = labelRadius * Math.cos(midAngle);
          const labelY = labelRadius * Math.sin(midAngle);
          const seg = (
            <g key={d.label}>
              <path
                d={pathData}
                fill={d.color || colors[i % colors.length]}
                stroke="#fff"
                strokeWidth={2}
                style={{
                  cursor: onSegmentClick ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  filter: "brightness(1)"
                }}
                onMouseEnter={(e) => {
                  if (onSegmentClick) {
                    e.currentTarget.style.filter = "brightness(1.1)";
                    e.currentTarget.style.strokeWidth = "3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (onSegmentClick) {
                    e.currentTarget.style.filter = "brightness(1)";
                    e.currentTarget.style.strokeWidth = "2";
                  }
                }}
                onClick={() => onSegmentClick && onSegmentClick(d.label)}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                fill="#222"
                fontWeight="bold"
              >
                {d.label}
              </text>
            </g>
          );
          startAngle = endAngle;
          return seg;
        })}
      </g>
      {/* ラベル表示削除済み */}
    </svg>
  );
};

// 仮データ例
// const sampleData = [
//   { label: "A", value: 10 },
//   { label: "B", value: 20 },
//   { label: "C", value: 30 },
//   { label: "D", value: 40 },
// ];
// <ToukeiPieChart data={sampleData} />

export default ToukeiPieChart;
