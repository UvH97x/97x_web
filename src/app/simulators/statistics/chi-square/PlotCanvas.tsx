'use client';

import { useEffect, useRef } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { centralDensity, noncentralDensity } from './lib/model';
import type { HistogramData, QuantilePoint, ShowState } from './lib/types';

function niceTicks(lo: number, hi: number, target: number): number[] {
  const raw = (hi - lo) / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let x = Math.ceil(lo / step) * step; x <= hi + 1e-9; x += step) ticks.push(Math.abs(x) < 1e-9 ? 0 : x);
  return ticks;
}

function tickLabel(value: number): string {
  if (Math.abs(value) >= 10 || Number.isInteger(value)) return String(Math.round(value * 100) / 100);
  return value.toFixed(1);
}

export function PlotCanvas({ df, lambda, hist, show, xMax, quantiles }: {
  df: number; lambda: number; hist: HistogramData; show: ShowState; xMax: number;
  quantiles: QuantilePoint[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      if (cssW === 0) return;
      const cssH = Math.round(cssW * 0.62);
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const margin = { l: 52, r: 16, t: 16, b: 34 };
      const width = cssW - margin.l - margin.r;
      const height = cssH - margin.t - margin.b;
      const densityX = (i: number) => ((i + 0.5) / 500) * xMax;
      let yMax = 0;
      if (show.hist) for (const value of hist.dens) yMax = Math.max(yMax, value);
      for (let i = 0; i < 500; i++) {
        const x = densityX(i);
        if (show.noncentral) yMax = Math.max(yMax, noncentralDensity(x, df, lambda));
        if (show.central) yMax = Math.max(yMax, centralDensity(x, df));
      }
      if (!(yMax > 0) || !Number.isFinite(yMax)) yMax = 1;
      yMax *= 1.15;

      const X = (x: number) => margin.l + (x / xMax) * width;
      const Y = (y: number) => margin.t + height - (Math.min(y, yMax) / yMax) * height;
      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const x of niceTicks(0, xMax, 7)) {
        const px = X(x);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(px, margin.t); ctx.lineTo(px, margin.t + height); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(tickLabel(x), px, margin.t + height + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (const y of niceTicks(0, yMax, 5)) {
        const py = Y(y);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(margin.l, py); ctx.lineTo(margin.l + width, py); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(y.toFixed(yMax < 0.2 ? 3 : 2), margin.l - 8, py);
      }
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('x', margin.l + width / 2, margin.t + height + 18);

      if (show.hist) {
        for (let b = 0; b < hist.nb; b++) {
          const x0 = b * hist.binW;
          if (x0 >= xMax || hist.dens[b] <= 0) continue;
          const px0 = X(x0);
          const px1 = X(Math.min(xMax, x0 + hist.binW));
          const py = Y(hist.dens[b]);
          ctx.fillStyle = colors.hist;
          ctx.fillRect(px0, py, px1 - px0, Y(0) - py);
          ctx.strokeStyle = colors.hist;
          ctx.beginPath(); ctx.moveTo(px0, py); ctx.lineTo(px1, py); ctx.stroke();
        }
      }

      function curve(fn: (x: number) => number, color: string, lineWidth: number) {
        if (!ctx) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        for (let i = 0; i < 500; i++) {
          const x = densityX(i);
          const px = X(x);
          const py = Y(fn(x));
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      if (show.central) curve(x => centralDensity(x, df), colors.gauss, 1.6);
      if (show.noncentral) curve(x => noncentralDensity(x, df, lambda), colors.ih, 2.2);

      if (show.quantiles) {
        ctx.strokeStyle = colors.fg;
        ctx.fillStyle = colors.fg;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.font = '10px ui-monospace,Menlo,monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        quantiles.forEach(({ probability, value }, index) => {
          const px = X(value);
          ctx.beginPath(); ctx.moveTo(px, margin.t); ctx.lineTo(px, margin.t + height); ctx.stroke();
          ctx.fillText(`${Math.round(probability * 100)}%`, px, margin.t + 3 + (index % 2) * 13);
        });
        ctx.setLineDash([]);
      }
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [df, lambda, hist, show, xMax, quantiles, colors]);

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', borderRadius: 6, background: colors.bg }} />;
}
