'use client';

import { useEffect, useRef } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { approxAt, fracText, levelStride, pointInfo } from './lib/model';
import type { ShowState } from './lib/types';

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
  if (Math.abs(v) < 1e-9) return '0';
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(3)));
}

type Geometry = { l: number; t: number; W: number; H: number; xLo: number; xHi: number };

type Props = {
  f: (x: number) => number;
  n: number;
  R: number;
  yTop: number;
  show: ShowState;
  hoverX: number | null;
  onHoverX: (x: number | null) => void;
};

export function PlotCanvas({ f, n, R, yTop, show, hoverX, onHoverX }: Props) {
  const colors = useThemeColors();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geomRef = useRef<Geometry | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // f_n / f / y=n reuse the shared plot tokens so both themes stay consistent.
    const cF = colors.gauss;
    const cFn = colors.hist;
    const cCap = colors.ih;

    function draw() {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      if (cssW === 0) return;
      const cssH = Math.round(Math.min(520, Math.max(300, cssW * 0.6)));

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const m = { l: 54, r: 18, t: 18, b: 36 };
      const W = cssW - m.l - m.r;
      const H = cssH - m.t - m.b;
      if (W <= 0 || H <= 0) return;

      const xLo = -R;
      const xHi = R;
      geomRef.current = { l: m.l, t: m.t, W, H, xLo, xHi };

      const X = (x: number) => m.l + ((x - xLo) / (xHi - xLo)) * W;
      const Y = (y: number) => m.t + H - (y / yTop) * H;
      const Yc = (y: number) => Math.min(m.t + H, Math.max(m.t, Y(y)));

      // Sample f a few times per pixel: the jumps of f_n then land sub-pixel.
      const count = Math.max(2, Math.round(W * 3));
      const xs = new Float64Array(count + 1);
      const fs = new Float64Array(count + 1);
      for (let i = 0; i <= count; i++) {
        const x = xLo + ((xHi - xLo) * i) / count;
        xs[i] = x;
        const v = f(x);
        fs[i] = Number.isFinite(v) ? Math.max(0, v) : 0;
      }

      ctx.lineWidth = 1;
      ctx.font = '11px ui-monospace,Menlo,monospace';

      // ── Background grid + axis labels ──
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const gx of niceTicks(xLo, xHi, 6)) {
        const px = X(gx);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + H); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(fmtTick(gx), px, m.t + H + 6);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (const gy of niceTicks(0, yTop, 5)) {
        const py = Y(gy);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(m.l + W, py); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(fmtTick(gy), m.l - 8, py);
      }
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('x', m.l + W / 2, m.t + H + 20);

      // ── Dyadic partition of the *range*, only up to the cap y = n ──
      if (show.levels) {
        const delta = 1 / 2 ** n;
        const stride = levelStride(n, yTop, 44);
        const top = Math.min(n, yTop);
        ctx.save();
        ctx.globalAlpha = 0.34;
        ctx.strokeStyle = cFn;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j * delta <= top + 1e-12; j += stride) {
          const py = Y(j * delta);
          ctx.moveTo(m.l, py); ctx.lineTo(m.l + W, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      /** Traces a right-continuous step through (xs, vals) without closing the path. */
      function traceStep(vals: Float64Array) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(X(xs[0]), Y(vals[0]));
        let prev = vals[0];
        for (let i = 1; i <= count; i++) {
          if (vals[i] === prev) continue;
          const px = X(xs[i]);
          ctx.lineTo(px, Y(prev));
          ctx.lineTo(px, Y(vals[i]));
          prev = vals[i];
        }
        ctx.lineTo(X(xs[count]), Y(prev));
      }

      const step = new Float64Array(count + 1);

      // ── f_1 … f_{n-1}: the increasing family behind the current step ──
      if (show.history) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1;
        for (let level = 1; level < n; level++) {
          for (let i = 0; i <= count; i++) step[i] = approxAt(fs[i], level);
          traceStep(step);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── f_n ──
      for (let i = 0; i <= count; i++) step[i] = approxAt(fs[i], n);
      traceStep(step);
      ctx.lineTo(X(xHi), Y(0));
      ctx.lineTo(X(xLo), Y(0));
      ctx.closePath();
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = cFn;
      ctx.fill();
      ctx.restore();

      traceStep(step);
      ctx.strokeStyle = cFn;
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── f ──
      ctx.strokeStyle = cF;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const px = X(xs[i]);
        const py = Y(fs[i]);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // ── Cap y = n ──
      if (show.cap) {
        ctx.font = '11px ui-monospace,Menlo,monospace';
        if (n <= yTop) {
          const py = Y(n);
          ctx.strokeStyle = cCap;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(m.l + W, py); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = cCap;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`y = n = ${n}`, m.l + 4, py - 3);
        } else {
          ctx.fillStyle = cCap;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(`y = n = ${n} は表示範囲外（切り詰めなし）`, m.l + W - 4, m.t + 2);
        }
      }

      // ── Hover: the level interval that decides k ──
      if (hoverX !== null && hoverX >= xLo && hoverX <= xHi) {
        const info = pointInfo(hoverX, f(hoverX), n);
        const px = X(info.x);

        if (info.k === null) {
          // Truncated branch: everything above y = n collapses onto n.
          ctx.save();
          ctx.globalAlpha = 0.14;
          ctx.fillStyle = cCap;
          ctx.fillRect(m.l, m.t, W, Math.max(0, Yc(n) - m.t));
          ctx.restore();
          // The band needs its lower edge even when the y = n overlay is off.
          if (!show.cap && n <= yTop) {
            ctx.strokeStyle = cCap;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(m.l, Y(n)); ctx.lineTo(m.l + W, Y(n));
            ctx.stroke();
          }
        } else {
          const lo = (info.k - 1) / info.den;
          const hi = info.k / info.den;
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = cFn;
          ctx.fillRect(m.l, Yc(hi), W, Math.max(1, Yc(lo) - Yc(hi)));
          ctx.restore();

          ctx.strokeStyle = cFn;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (const v of [lo, hi]) {
            if (v > yTop) continue;
            const py = Y(v);
            ctx.moveTo(m.l, py); ctx.lineTo(m.l + W, py);
          }
          ctx.stroke();

          ctx.fillStyle = cFn;
          ctx.font = '10px ui-monospace,Menlo,monospace';
          ctx.textAlign = 'right';
          if (hi <= yTop) {
            ctx.textBaseline = 'bottom';
            ctx.fillText(fracText(info.k, n), m.l + W - 4, Y(hi) - 2);
          }
          // At lo = 0 the label would land among the x tick labels, so flip it inside.
          ctx.textBaseline = lo <= 0 ? 'bottom' : 'top';
          ctx.fillText(fracText(info.k - 1, n), m.l + W - 4, Y(lo) + (lo <= 0 ? -2 : 2));
        }

        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + H); ctx.stroke();
        ctx.setLineDash([]);

        // The gap f(x) − f_n(x) as a single vertical segment.
        ctx.strokeStyle = colors.fg;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, Yc(info.fn));
        ctx.lineTo(px, Yc(info.fx));
        ctx.stroke();

        for (const [v, color] of [[info.fn, cFn], [info.fx, cF]] as const) {
          if (v > yTop) continue;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(px, Y(v), 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = colors.bg;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    draw();
    const obs = new ResizeObserver(draw);
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [f, n, R, yTop, show, hoverX, colors]);

  function xFromClientX(clientX: number, canvas: HTMLCanvasElement): number | null {
    const g = geomRef.current;
    if (!g) return null;
    const px = clientX - canvas.getBoundingClientRect().left;
    if (px < g.l || px > g.l + g.W) return null;
    return g.xLo + ((px - g.l) / g.W) * (g.xHi - g.xLo);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLCanvasElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = (2 * R) / (event.shiftKey ? 20 : 200);
    const current = hoverX ?? 0;
    const next = current + (event.key === 'ArrowRight' ? step : -step);
    onHoverX(Math.min(R, Math.max(-R, next)));
  }

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      role="img"
      aria-label="f(x) と単函数近似 f_n(x) のグラフ。左右キーで観測点を動かせます。"
      className="block w-full rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ background: colors.bg, touchAction: 'pan-y' }}
      onPointerMove={e => onHoverX(xFromClientX(e.clientX, e.currentTarget))}
      onPointerDown={e => onHoverX(xFromClientX(e.clientX, e.currentTarget))}
      onPointerLeave={() => onHoverX(null)}
      onKeyDown={handleKeyDown}
    />
  );
}
