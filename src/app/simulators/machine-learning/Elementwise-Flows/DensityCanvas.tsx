'use client';

import { useEffect, useRef } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { BASES, pushforwardDensity, ticks } from './lib/model';
import type { BaseId, DensityRange, FlowFn, HistogramData, QuantilePoint, ShowState } from './lib/types';

/** 尖った密度（g′ が小さい所）も拾えるよう、関数グラフより細かく評価する。 */
const DENSITY_GRID = 800;

interface Props {
  fn: FlowFn;
  base: BaseId;
  range: DensityRange;
  hist: HistogramData;
  show: ShowState;
  quantiles: QuantilePoint[];
}

export function DensityCanvas({ fn, base, range, hist, show, quantiles }: Props) {
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
      const cssH = Math.round(cssW * 0.82);
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const margin = { l: 50, r: 14, t: 14, b: 34 };
      const width = cssW - margin.l - margin.r;
      const height = cssH - margin.t - margin.b;
      const { xMin, xMax } = range;

      const xs = Array.from({ length: DENSITY_GRID + 1 }, (_, i) => xMin + (i / DENSITY_GRID) * (xMax - xMin));
      const theory = xs.map(y => pushforwardDensity(fn, base, y));
      const pdfZ = BASES[base].pdf;
      const baseValues = show.base ? xs.map(pdfZ) : null;

      // --- 縦軸 -------------------------------------------------------------
      let main = 0;
      if (show.hist) for (const value of hist.values) main = Math.max(main, value);
      if (show.theory) for (const value of theory) if (Number.isFinite(value)) main = Math.max(main, value);
      // 端で発散する密度でも中心部が潰れないよう、分布エクスプローラと同じく四分位範囲で頭打ちにする。
      const q = (p: number) => quantiles.find(point => point.probability === p)?.y ?? 0;
      const iqr = q(0.75) - q(0.25);
      if (iqr > 0) main = Math.min(main, 3 / iqr);
      if (baseValues && !(main > 0)) for (const value of baseValues) main = Math.max(main, value);
      let yMax = main > 0 && Number.isFinite(main) ? main : 1;
      yMax *= 1.12;

      const X = (x: number) => margin.l + ((x - xMin) / (xMax - xMin)) * width;
      const Y = (y: number) => {
        const clamped = Number.isNaN(y) ? 0 : Math.max(0, Math.min(y, yMax * 2));
        return margin.t + height - (clamped / yMax) * height;
      };

      // --- 軸 ---------------------------------------------------------------
      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const xTicks = ticks(xMin, xMax, 6);
      for (const x of xTicks.values) {
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(X(x), margin.t); ctx.lineTo(X(x), margin.t + height); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(x.toFixed(xTicks.digits), X(x), margin.t + height + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yTicks = ticks(0, yMax, 5);
      for (const y of yTicks.values) {
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(margin.l, Y(y)); ctx.lineTo(margin.l + width, Y(y)); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(y.toFixed(yTicks.digits), margin.l - 7, Y(y));
      }
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('y', margin.l + width / 2, margin.t + height + 19);
      ctx.save();
      ctx.translate(11, margin.t + height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText('密度', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(margin.l, margin.t, width, height);
      ctx.clip();

      if (show.hist) {
        ctx.fillStyle = colors.hist;
        for (let k = 0; k < hist.values.length; k++) {
          if (hist.values[k] <= 0) continue;
          const left = hist.x0 + k * hist.binW;
          const py = Y(hist.values[k]);
          ctx.fillRect(X(left), py, X(left + hist.binW) - X(left), Y(0) - py);
        }
      }

      const polyline = (values: number[], color: string, lineWidth: number, dash: number[] = []) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.setLineDash(dash);
        ctx.beginPath();
        values.forEach((value, i) => (i === 0 ? ctx.moveTo(X(xs[i]), Y(value)) : ctx.lineTo(X(xs[i]), Y(value))));
        ctx.stroke();
        ctx.setLineDash([]);
      };
      if (baseValues) polyline(baseValues, colors.muted, 1.4, [5, 4]);
      if (show.theory) polyline(theory, colors.ih, 2.2);
      ctx.restore();
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [fn, base, range, hist, show, quantiles, colors]);

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', borderRadius: 6, background: colors.bg }} />;
}
