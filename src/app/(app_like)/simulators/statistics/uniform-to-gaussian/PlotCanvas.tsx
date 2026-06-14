'use client';

import { useRef, useEffect } from 'react';
import type { IrwinHallData, HistogramData, ShowState } from './lib/types';
import { ihDensityAt, gaussDensity } from './lib/model';

const C = {
  bg:        '#0C0F16',
  grid:      '#222A3A',
  muted:     '#6C7993',
  faint:     '#404B61',
  cHist:     '#3E5A74',
  cHistEdge: '#6E9AC0',
  cIh:       '#E8B84B',
  cGauss:    '#E06C75',
  cTrunc:    '#7C8398',
} as const;

function hexAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function niceTicks(lo: number, hi: number, target: number): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out: number[] = [];
  let v = Math.ceil(lo / step) * step;
  for (; v <= hi + 1e-9; v += step) out.push(Math.abs(v) < 1e-9 ? 0 : v);
  return out;
}

function fmtTick(v: number): string {
  return Math.abs(v) < 1e-9 ? '0' : Number.isInteger(v) ? String(v) : v.toFixed(1);
}

type Props = {
  N: number;
  hist: HistogramData;
  ihD: IrwinHallData;
  show: ShowState;
  R: number;
};

export function PlotCanvas({ N, hist, ihD, show, R }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr  = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      if (cssW === 0) return;
      const cssH = Math.round(cssW * 0.62);

      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const m = { l: 52, r: 16, t: 16, b: 34 };
      const W = cssW - m.l - m.r;
      const H = cssH - m.t - m.b;

      // Determine y-axis upper bound from visible overlays
      let yMax = 0;
      const peakG = gaussDensity(0);
      if (show.gauss) yMax = Math.max(yMax, peakG);
      if (show.ih)    yMax = Math.max(yMax, ihDensityAt(0, ihD));
      if (show.hist)  for (let b = 0; b < hist.nb; b++) yMax = Math.max(yMax, hist.dens[b]);
      if (yMax <= 0)  yMax = peakG;
      yMax *= 1.15;

      const X = (g: number) => m.l + ((g + R) / (2 * R)) * W;
      const Y = (d: number) => m.t + H - (d / yMax) * H;

      // Grid lines + axis labels
      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace,Menlo,monospace';

      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      for (const gx of niceTicks(-R, R, 6)) {
        const px = X(gx);
        ctx.strokeStyle = C.grid;
        ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + H); ctx.stroke();
        ctx.fillStyle = C.muted;
        ctx.fillText(fmtTick(gx), px, m.t + H + 6);
      }

      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      for (const dy of niceTicks(0, yMax, 5)) {
        const py = Y(dy);
        ctx.strokeStyle = C.grid;
        ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(m.l + W, py); ctx.stroke();
        ctx.fillStyle = C.muted;
        ctx.fillText(dy.toFixed(2), m.l - 8, py);
      }

      ctx.fillStyle    = C.faint;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('g  (σ)', m.l + W / 2, m.t + H + 18);

      // Histogram bars
      if (show.hist) {
        ctx.lineWidth = 1;
        for (let b = 0; b < hist.nb; b++) {
          if (hist.dens[b] <= 0) continue;
          const g0 = -R + b * hist.binW;
          const x0 = X(g0), x1 = X(g0 + hist.binW);
          const y0 = Y(hist.dens[b]), yb = Y(0);
          ctx.fillStyle   = hexAlpha(C.cHist, 0.55);
          ctx.fillRect(x0, y0, x1 - x0, yb - y0);
          ctx.strokeStyle = C.cHistEdge;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
        }
      }

      // Smooth density curves
      function curve(fn: (g: number) => number, color: string, width: number) {
        if (!ctx) return;
        ctx.strokeStyle = color;
        ctx.lineWidth   = width;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 480; i++) {
          const g  = -R + (i / 480) * 2 * R;
          const px = X(g), py = Y(fn(g));
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      if (show.gauss) curve(gaussDensity,              C.cGauss, 1.6);
      if (show.ih)    curve(g => ihDensityAt(g, ihD),  C.cIh,   2.2);

      // ±√(3N) truncation markers
      if (show.ih || show.hist) {
        const t = Math.sqrt(3 * N);
        if (t < R) {
          ctx.strokeStyle = C.cTrunc;
          ctx.lineWidth   = 1;
          ctx.setLineDash([4, 4]);
          for (const gx of [-t, t]) {
            const px = X(gx);
            ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + H); ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.fillStyle    = C.cTrunc;
          ctx.font         = '10px ui-monospace,Menlo,monospace';
          ctx.textAlign    = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText('±√(3N)', X(t) + 4, m.t + 2);
        }
      }
    }

    draw();

    const obs = new ResizeObserver(draw);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [N, hist, ihD, show, R]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', display: 'block', borderRadius: '6px', background: C.bg }}
    />
  );
}
