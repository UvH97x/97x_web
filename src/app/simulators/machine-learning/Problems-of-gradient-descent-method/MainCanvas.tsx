'use client';

import React, { useMemo } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { SimulationState } from './utils/types';
import { plotCurves, plotDomain } from './utils/plotDataGenerator';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Legend, Tooltip);

type Props = { state: SimulationState };

/** useThemeColors は `rgb(r g b)` を返すので、CSS Color 4 のスラッシュ記法で透明度を足す。 */
const fade = (color: string, alpha: number) => color.replace(/\)$/, ` / ${alpha})`);

export default function MainCanvas({ state }: Props) {
  const colors = useThemeColors();
  const { xMin, xMax } = plotDomain(state);

  // 曲線は誤差関数と描画範囲にしか依存しない。1ステップごとに作り直すと重いのでメモ化する
  const { errorCurve, gradCurve, eMin, eMax } = useMemo(() => {
    const curves = plotCurves(state.errorFunction, xMin, xMax);
    const errorValues = curves.errorCurve.map((p) => p.y);
    // 現在の w を示す縦線は E 軸の描画範囲いっぱいに引く
    return { ...curves, eMin: Math.min(...errorValues), eMax: Math.max(...errorValues) };
  }, [state.errorFunction, xMin, xMax]);

  // 現在位置（補間なし、ただの最新値）
  const currentStep = state.steps[state.step] ?? state.steps[state.steps.length - 1];
  const { w: currentW, error: currentE, grad: currentGrad } = currentStep;

  const data = {
    datasets: [
      {
        label: '誤差 E(w)',
        data: errorCurve,
        yAxisID: 'yE',
        borderColor: colors.hist,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: '勾配 dE/dw',
        data: gradCurve,
        yAxisID: 'yG',
        borderColor: colors.ih,
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        // 凡例から除くため label は空
        label: '',
        data: [
          { x: currentW, y: eMin },
          { x: currentW, y: eMax },
        ],
        yAxisID: 'yE',
        borderColor: fade(colors.gauss, 0.45),
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
      },
      {
        label: '現在位置',
        data: [{ x: currentW, y: currentE }],
        yAxisID: 'yE',
        borderColor: 'rgba(0,0,0,0)',
        backgroundColor: colors.gauss,
        pointBackgroundColor: colors.gauss,
        pointRadius: 7,
        pointHoverRadius: 8,
      },
      {
        label: '',
        data: [{ x: currentW, y: currentGrad }],
        yAxisID: 'yG',
        borderColor: 'rgba(0,0,0,0)',
        backgroundColor: colors.gauss,
        pointBackgroundColor: colors.gauss,
        pointStyle: 'triangle' as const,
        pointRadius: 8,
        pointHoverRadius: 9,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 } as const,
    interaction: { mode: 'nearest' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: colors.fg,
          boxWidth: 18,
          padding: 12,
          filter: (item: { text?: string }) => Boolean(item.text),
        },
      },
      tooltip: {
        callbacks: {
          title: (items: { parsed: { x: number | null } }[]) =>
            `w = ${(items[0]?.parsed.x ?? 0).toFixed(3)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: xMin,
        max: xMax,
        ticks: { color: colors.muted, maxTicksLimit: 11 },
        grid: { color: fade(colors.border, 0.8) },
        border: { color: colors.border },
        title: { display: true, text: 'パラメータ w', color: colors.fg },
      },
      yE: {
        type: 'linear' as const,
        position: 'left' as const,
        ticks: { color: colors.hist },
        grid: { color: fade(colors.border, 0.8) },
        border: { color: colors.border },
        title: { display: true, text: '誤差 E(w)', color: colors.hist },
      },
      yG: {
        type: 'linear' as const,
        position: 'right' as const,
        ticks: { color: colors.ih },
        grid: { drawOnChartArea: false },
        border: { color: colors.border },
        title: { display: true, text: '勾配 dE/dw', color: colors.ih },
      },
    },
  };

  return (
    <div className="rounded-xl bg-bg p-2 shadow">
      <div className="h-[clamp(300px,56vh,560px)]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
