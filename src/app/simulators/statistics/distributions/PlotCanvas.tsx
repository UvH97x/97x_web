'use client';

import { useEffect, useRef } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { cdfAt, countAtMost, niceStep, stepDigits } from './lib/model';
import type {
  DistributionDef, HistogramData, Interval, Params, PlotRange, QuantilePoint, ShowState, View,
} from './lib/types';

const GRID = 400;

function ticks(lo: number, hi: number, target: number, integerOnly = false): { values: number[]; digits: number } {
  let step = niceStep((hi - lo) / target);
  if (integerOnly) step = Math.max(1, Math.round(step));
  const values: number[] = [];
  for (let x = Math.ceil(lo / step - 1e-9) * step; x <= hi + step * 1e-9; x += step) {
    values.push(Math.abs(x) < step * 1e-9 ? 0 : x);
  }
  return { values, digits: stepDigits(step) };
}

interface Props {
  def: DistributionDef;
  params: Params;
  view: View;
  range: PlotRange;
  /** PDF / PMF 表示用。 */
  hist: HistogramData | null;
  /** CDF 表示用（昇順に整列した標本）。 */
  sorted: Float64Array | null;
  show: ShowState;
  quantiles: QuantilePoint[];
  interval: Interval;
}

export function PlotCanvas({ def, params, view, range, hist, sorted, show, quantiles, interval }: Props) {
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

      const margin = { l: 58, r: 16, t: 16, b: 34 };
      const width = cssW - margin.l - margin.r;
      const height = cssH - margin.t - margin.b;
      const { xMin, xMax } = range;
      const discrete = def.kind === 'discrete';
      const isCdf = view === 'cdf';

      // --- Evaluate everything once -------------------------------------
      const xs = new Float64Array(GRID + 1);
      for (let i = 0; i <= GRID; i++) xs[i] = xMin + (i / GRID) * (xMax - xMin);
      const ks: number[] = [];
      if (discrete) for (let k = range.lo; k <= range.hi; k++) ks.push(k);

      const fn = isCdf ? def.cdf : def.pdf;
      const theory = discrete ? ks.map(k => fn(k, params)) : Array.from(xs, x => fn(x, params));
      const reference = def.reference && show.reference
        ? Array.from(xs, x => (isCdf ? def.reference!.cdf(x, params) : def.reference!.pdf(x, params)))
        : null;

      // --- Vertical scale -----------------------------------------------
      let yMax = 1;
      if (!isCdf) {
        let main = 0;
        if (show.hist && hist) for (const value of hist.values) main = Math.max(main, value);
        if (show.theory) for (const value of theory) if (Number.isFinite(value)) main = Math.max(main, value);
        if (!discrete) {
          // Densities may diverge at the edge of the support (e.g. χ² with ν = 1).
          // Cap the axis relative to the interquartile range so the bulk stays readable.
          const q = (p: number) => quantiles.find(point => point.probability === p)?.value ?? 0;
          const iqr = q(0.75) - q(0.25);
          if (iqr > 0) main = Math.min(main, 3 / iqr);
        }
        let refMax = 0;
        if (reference) for (const value of reference) if (Number.isFinite(value)) refMax = Math.max(refMax, value);
        yMax = main > 0 ? Math.max(main, Math.min(refMax, 4 * main)) : refMax;
        if (!(yMax > 0) || !Number.isFinite(yMax)) yMax = 1;
      }
      yMax *= isCdf ? 1.06 : 1.12;

      const X = (x: number) => margin.l + ((x - xMin) / (xMax - xMin)) * width;
      const Y = (y: number) => {
        const clamped = Number.isNaN(y) ? 0 : Math.max(0, Math.min(y, yMax));
        return margin.t + height - (clamped / yMax) * height;
      };
      const clampX = (x: number) => Math.max(xMin, Math.min(xMax, x));

      // --- Axes -----------------------------------------------------------
      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace,Menlo,monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const xTicks = ticks(xMin, xMax, 7, discrete);
      for (const x of xTicks.values) {
        const px = X(x);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(px, margin.t); ctx.lineTo(px, margin.t + height); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(x.toFixed(xTicks.digits), px, margin.t + height + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yTicks = ticks(0, isCdf ? 1 : yMax, 5);
      for (const y of yTicks.values) {
        const py = Y(y);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(margin.l, py); ctx.lineTo(margin.l + width, py); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(y.toFixed(yTicks.digits), margin.l - 8, py);
      }
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(discrete ? 'k' : 'x', margin.l + width / 2, margin.t + height + 18);
      ctx.save();
      ctx.translate(11, margin.t + height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText(isCdf ? '累積確率' : discrete ? '確率' : '密度', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.rect(margin.l, margin.t, width, height);
      ctx.clip();

      // Interval ends in plot coordinates. Discrete intervals are widened by half
      // a unit so that every included integer (even a single one) is covered.
      const pad = discrete ? 0.5 : 0;
      const bandLo = clampX(interval.a - pad);
      const bandHi = clampX(interval.b + pad);

      function polyline(values: ArrayLike<number>, color: string, lineWidth: number) {
        if (!ctx) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i <= GRID; i++) {
          if (i === 0) ctx.moveTo(X(xs[i]), Y(values[i])); else ctx.lineTo(X(xs[i]), Y(values[i]));
        }
        ctx.stroke();
      }

      if (!isCdf) {
        // --- PDF / PMF ---------------------------------------------------
        if (show.hist && hist) {
          const inset = discrete ? 0.15 : 0;
          ctx.fillStyle = colors.hist;
          for (let b = 0; b < hist.values.length; b++) {
            if (hist.values[b] <= 0) continue;
            const left = hist.x0 + b * hist.binW;
            const px0 = X(left + inset);
            const px1 = X(left + hist.binW - inset);
            const py = Y(hist.values[b]);
            ctx.fillRect(px0, py, px1 - px0, Y(0) - py);
          }
        }

        if (show.interval && bandHi > bandLo) {
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = colors.accent;
          if (discrete) {
            ks.forEach((k, j) => {
              if (k < interval.a || k > interval.b) return;
              const py = Y(theory[j]);
              ctx.fillRect(X(k - 0.5), py, X(k + 0.5) - X(k - 0.5), Y(0) - py);
            });
          } else {
            const steps = 200;
            ctx.beginPath();
            ctx.moveTo(X(bandLo), Y(0));
            for (let i = 0; i <= steps; i++) {
              const x = bandLo + (i / steps) * (bandHi - bandLo);
              ctx.lineTo(X(x), Y(def.pdf(x, params)));
            }
            ctx.lineTo(X(bandHi), Y(0));
            ctx.closePath();
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        if (reference) polyline(reference, colors.gauss, 1.6);

        if (show.theory) {
          if (discrete) {
            ctx.strokeStyle = colors.ih;
            ctx.fillStyle = colors.ih;
            ctx.lineWidth = 2;
            const radius = Math.max(1.5, Math.min(3.5, (X(1) - X(0)) * 0.28));
            ks.forEach((k, j) => {
              const px = X(k);
              const py = Y(theory[j]);
              ctx.beginPath(); ctx.moveTo(px, Y(0)); ctx.lineTo(px, py); ctx.stroke();
              ctx.beginPath(); ctx.arc(px, py, radius, 0, 2 * Math.PI); ctx.fill();
            });
          } else {
            polyline(theory, colors.ih, 2.2);
          }
        }
      } else {
        // --- CDF ---------------------------------------------------------
        if (show.interval && bandHi > bandLo) {
          ctx.globalAlpha = 0.14;
          ctx.fillStyle = colors.accent;
          ctx.fillRect(X(bandLo), margin.t, X(bandHi) - X(bandLo), height);
          // F at both ends: the gap between the two levels is the interval probability.
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 3]);
          for (const level of [cdfAt(def, params, discrete ? interval.a - 1 : interval.a), cdfAt(def, params, interval.b)]) {
            ctx.beginPath(); ctx.moveTo(margin.l, Y(level)); ctx.lineTo(margin.l + width, Y(level)); ctx.stroke();
          }
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }

        // Right-continuous step function through (k, values[j]).
        const steps = (before: number, values: ArrayLike<number>, color: string, lineWidth: number, risers: boolean) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.lineJoin = 'miter';
          ctx.beginPath();
          ctx.moveTo(X(xMin), Y(before));
          ctx.lineTo(X(ks[0]), Y(before));
          ks.forEach((k, j) => {
            if (risers) ctx.lineTo(X(k), Y(values[j])); else ctx.moveTo(X(k), Y(values[j]));
            ctx.lineTo(X(j + 1 < ks.length ? ks[j + 1] : xMax), Y(values[j]));
          });
          ctx.stroke();
        };

        if (show.hist && sorted) {
          const n = sorted.length;
          if (discrete) {
            steps(countAtMost(sorted, ks[0] - 1) / n, ks.map(k => countAtMost(sorted, k) / n), colors.hist, 5, true);
          } else {
            polyline(Array.from(xs, x => countAtMost(sorted, x) / n), colors.hist, 5);
          }
        }

        if (reference) polyline(reference, colors.gauss, 1.6);

        if (show.theory) {
          if (discrete) {
            steps(def.cdf(ks[0] - 1, params), theory, colors.ih, 2, false);
            ctx.fillStyle = colors.ih;
            const radius = Math.max(1.5, Math.min(3, (X(1) - X(0)) * 0.25));
            ks.forEach((k, j) => {
              ctx.beginPath(); ctx.arc(X(k), Y(theory[j]), radius, 0, 2 * Math.PI); ctx.fill();
            });
          } else {
            polyline(theory, colors.ih, 2.2);
          }
        }
      }

      if (show.interval) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        for (const edge of [interval.a - pad, interval.b + pad]) {
          if (!Number.isFinite(edge) || edge < xMin || edge > xMax) continue;
          ctx.beginPath(); ctx.moveTo(X(edge), margin.t); ctx.lineTo(X(edge), margin.t + height); ctx.stroke();
        }
      }

      if (show.quantiles) {
        ctx.strokeStyle = colors.fg;
        ctx.fillStyle = colors.fg;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.font = '10px ui-monospace,Menlo,monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        quantiles.forEach(({ probability, value }, index) => {
          // Heavy tails are cut from the plot, and their outer quantiles with them.
          if (value < xMin || value > xMax) return;
          const px = X(value);
          ctx.beginPath(); ctx.moveTo(px, margin.t); ctx.lineTo(px, margin.t + height); ctx.stroke();
          ctx.fillText(`${Math.round(probability * 100)}%`, px, margin.t + 3 + (index % 2) * 13);
        });
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [def, params, view, range, hist, sorted, show, quantiles, interval, colors]);

  return <canvas ref={canvasRef} style={{ width: '100%', display: 'block', borderRadius: 6, background: colors.bg }} />;
}
