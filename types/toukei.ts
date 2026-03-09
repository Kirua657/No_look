// types/toukei.ts
// 円グラフ用データ型定義
export type PieData = {
  label: string;
  value: number;
  color?: string;
};

export type ToukeiPieChartProps = {
  data: PieData[];
  size?: number;
};

// 1週間統計データ型定義
export type WeeklyStatsData = {
  weekDays: string[];
  values: number[];
  totalCount: number;
  average: number;
  trend: "上昇" | "下降" | "安定";
};
