// GraphCanvas.tsx

"use client";

import { Scatter } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"
import { FC } from "react"
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { trueFunction } from "./lib/generateData";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// 真のモデル（ノイズなし）の曲線。データに依存しないので一度だけ計算する
const TRUE_CURVE = Array.from({ length: 121 }, (_, i) => {
  const x = -6 + (12 * i) / 120
  return { x, y: trueFunction(x) }
})

type Props = {
  dataPoints: [number, number][]
  modelCurve: [number, number][]
}

export const GraphCanvas: FC<Props> = ({ dataPoints, modelCurve }) => {
  const colors = useThemeColors();
  const axis = { ticks: { color: colors.muted }, grid: { color: colors.border }, border: { color: colors.border } };
  // データ点とモデル曲線をChart.jsの形式に変換
  const chartData = {
    datasets: [
      {
        label: "Data Points",
        data: dataPoints.map(([x, y]) => ({ x, y })),
        backgroundColor: "rgba(255, 99, 132, 1)",
        showLine: false,
        pointRadius: 5,
      },
      {
        label: "Model",
        data: modelCurve.map(([x, y]) => ({ x, y })),
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "True Model",
        data: TRUE_CURVE,
        borderColor: colors.muted,
        borderWidth: 1.5,
        borderDash: [6, 4],
        showLine: true,
        fill: false,
        pointRadius: 0,
      },
    ],
  }

  // データは x ~ U[-5, 5], y = x³ − 10x + N(0, 5²)（lib/generateData.ts の TRUE_MODEL）。
  // 表示範囲を固定して、データの再生成や学習中に軸が動かないようにする。
  const options = {
    responsive: true,
    animation: false as const,
    plugins: { legend: { labels: { color: colors.fg } } },
    scales: {
      x: {
        ...axis,
        min: -6,
        max: 6,
      },
      y: {
        ...axis,
        min: -90,
        max: 90,
      },
    },
  }

  return <Scatter data={chartData} options={options} />
}
