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

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  dataPoints: [number, number][]
  modelCurve: [number, number][]
}

export const GraphCanvas: FC<Props> = ({ dataPoints, modelCurve }) => {
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
    ],
  }

  const yValues = dataPoints.map(([_, y]) => y);

  const options = {
    responsive: true,
    scales: {
      x: {
        min: -11,
        max: 11,
      },
      y: {
        min: Math.min(...yValues)*1.3,
        max: Math.max(...yValues)*1.3,
      },
    },
  }

  return <Scatter data={chartData} options={options} />
}