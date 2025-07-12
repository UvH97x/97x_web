'use client';

import React from 'react';
import { SimulationState } from './utils/types';
import { plotDataGenerator } from './utils/plotDataGenerator';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Legend, Tooltip);

type Props = { state: SimulationState };

export default function MainCanvas({ state }: Props) {
  const { errorCurve, gradCurve } = plotDataGenerator(state);

  // 現在位置（補間なし、ただの最新値）
  const currentStep = state.steps[state.step] ?? state.steps[state.steps.length - 1];
  const currentW = currentStep.w;
  const currentE = currentStep.error;
  const currentGrad = currentStep.grad;

  // 誤差関数グラフ
  const errorData = {
    labels: errorCurve.map((p) => p.x.toFixed(2)),
    datasets: [
      {
        label: '誤差関数 E(w)',
        data: errorCurve.map((p) => p.y),
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.18,
      },
      {
        label: '現在のパラメータ位置',
        data: errorCurve.map((p) =>
          Math.abs(p.x - currentW) < 0.025 ? currentE : null
        ),
        pointBackgroundColor: 'rgba(220,38,38,1)',
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointRadius: 7,
        type: 'line' as const,
      },
    ],
  };

  // 勾配曲線グラフ
  const gradData = {
    labels: gradCurve.map((p) => p.x.toFixed(2)),
    datasets: [
      {
        label: '勾配 dE/dw',
        data: gradCurve.map((p) => p.y),
        borderColor: 'rgba(34,197,94,1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.18,
      },
      {
        label: '現在位置',
        data: gradCurve.map((p) =>
          Math.abs(p.x - currentW) < 0.025 ? currentGrad : null
        ),
        pointBackgroundColor: 'rgba(220,38,38,1)',
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        pointRadius: 7,
        type: 'line' as const,
      },
    ],
  };

  // オプション類
  const errorOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { title: { display: true, text: 'E(w)' }, grid: { color: '#eee' } },
    },
    animation: {
      duration: 0,
    },
  };
  const gradOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'パラメータ w' }, grid: { color: '#ddd' } },
      y: { title: { display: true, text: 'dE/dw' }, grid: { color: '#eee' } },
    },
    animation: {
      duration: 0
    },
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="bg-white rounded-xl shadow p-2">
        <Line data={errorData} options={errorOptions} height={200} />
      </div>
      <div className="bg-white rounded-xl shadow p-2">
        <Line data={gradData} options={gradOptions} height={200} />
      </div>
    </div>
  );
}