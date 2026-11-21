'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useThemeColors } from '@/src/components/ui/useThemeColors';
import { GRID, functionGrid, functionView, ticks } from './lib/model';
import type { FlowDef, FlowFn, FlowParams, FunctionView, ShowState } from './lib/types';

interface Props {
  def: FlowDef;
  params: FlowParams;
  fn: FlowFn;
  show: ShowState;
  onDrag: (index: number, x: number, y: number) => void;
}

/** 描画時の座標変換。ポインター操作でデータ座標へ戻すために保持する。 */
interface Geometry {
  invX: (px: number) => number;
  invY: (py: number) => number;
  handles: { px: number; py: number }[];
}

export function FunctionCanvas({ def, params, fn, show, onDrag }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geometry = useRef<Geometry | null>(null);
  const colors = useThemeColors();
  const computed = useMemo(() => functionView(def, params, fn), [def, params, fn]);
  // ドラッグ中は軸を固定し、点の側が動いて見えるようにする。
  const [frozen, setFrozen] = useState<FunctionView | null>(null);
  const view = frozen ?? computed;
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const handles = useMemo(() => def.handles?.(params) ?? [], [def, params]);

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

      const margin = { l: 50, r: show.derivative ? 48 : 14, t: 14, b: 34 };
      const width = cssW - margin.l - margin.r;
      const height = cssH - margin.t - margin.b;
      const { xMin, xMax, yMin, yMax } = view;
      const span = yMax - yMin;

      // --- 評価 -------------------------------------------------------------
      const xs = functionGrid(def, params);
      const gs = Array.from(xs, x => fn.forward(x));
      const ts = Array.from({ length: GRID + 1 }, (_, i) => xMin + (i / GRID) * (xMax - xMin));
      const inv = show.inverse ? ts.map(t => fn.inverse(t)) : null;
      const ds = show.derivative ? Array.from(xs, x => fn.derivative(x)) : null;

      // g′ の副軸。logit のように端で発散する場合は、90% 点の 4 倍で頭打ちにする。
      let dMax = 1;
      if (ds) {
        const finite = ds.filter(Number.isFinite).sort((a, b) => a - b);
        if (finite.length > 0) {
          const top = finite[finite.length - 1];
          const q90 = finite[Math.floor(0.9 * (finite.length - 1))];
          dMax = Math.min(top, 4 * q90) * 1.1;
        }
        if (!(dMax > 0) || !Number.isFinite(dMax)) dMax = 1;
      }

      const X = (x: number) => margin.l + ((x - xMin) / (xMax - xMin)) * width;
      // 画面外の大きな値は、キャンバスの座標が極端にならない程度に切り詰める。
      const Y = (y: number) => {
        const clamped = Math.max(yMin - 10 * span, Math.min(yMax + 10 * span, y));
        return margin.t + height - ((clamped - yMin) / span) * height;
      };
      const YD = (d: number) => margin.t + height - (Math.max(0, Math.min(d, dMax * 10)) / dMax) * height;

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
      const yTicks = ticks(yMin, yMax, 6);
      for (const y of yTicks.values) {
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(margin.l, Y(y)); ctx.lineTo(margin.l + width, Y(y)); ctx.stroke();
        ctx.fillStyle = colors.muted;
        ctx.fillText(y.toFixed(yTicks.digits), margin.l - 7, Y(y));
      }
      if (ds) {
        ctx.textAlign = 'left';
        ctx.fillStyle = colors.hist;
        const dTicks = ticks(0, dMax, 5);
        for (const d of dTicks.values) ctx.fillText(d.toFixed(dTicks.digits), margin.l + width + 6, YD(d));
      }
      ctx.fillStyle = colors.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('x', margin.l + width / 2, margin.t + height + 19);
      ctx.save();
      ctx.translate(11, margin.t + height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText('g(x)', 0, 0);
      ctx.restore();
      if (ds) {
        ctx.save();
        ctx.translate(cssW - 8, margin.t + height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.textBaseline = 'middle';
        ctx.fillStyle = colors.hist;
        ctx.fillText("g′(x)", 0, 0);
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(margin.l, margin.t, width, height);
      ctx.clip();

      // 有限でない値で線を切る折れ線。
      const curve = (px: ArrayLike<number>, values: ArrayLike<number>, map: (v: number) => number,
        color: string, lineWidth: number, dash: number[] = []) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.setLineDash(dash);
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < values.length; i++) {
          if (!Number.isFinite(values[i])) { pen = false; continue; }
          if (pen) ctx.lineTo(X(px[i]), map(values[i])); else ctx.moveTo(X(px[i]), map(values[i]));
          pen = true;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      const region = def.region?.(params);
      if (region) {
        ctx.strokeStyle = colors.muted;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.strokeRect(X(region[0]), Y(region[3]), X(region[1]) - X(region[0]), Y(region[2]) - Y(region[3]));
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      if (show.identity) {
        ctx.globalAlpha = 0.7;
        curve([xMin, xMax], [xMin, xMax], Y, colors.muted, 1, [6, 4]);
        ctx.globalAlpha = 1;
      }
      if (ds) curve(xs, ds, YD, colors.hist, 1.6);
      if (inv) curve(ts, inv, Y, colors.gauss, 1.8, [7, 4]);
      curve(xs, gs, Y, colors.ih, 2.4);

      // --- ハンドル ---------------------------------------------------------
      const points = handles.map(h => ({ px: X(h.x), py: Y(h.y) }));
      if (def.polygon && points.length > 1) {
        ctx.strokeStyle = colors.muted;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        points.forEach(({ px, py }, i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      points.forEach(({ px, py }, i) => {
        const active = i === dragging || (dragging === null && i === hover);
        ctx.beginPath();
        ctx.arc(px, py, active ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = colors.accent;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = colors.bg;
        ctx.stroke();
      });
      ctx.restore();

      geometry.current = {
        invX: px => xMin + ((px - margin.l) / width) * (xMax - xMin),
        invY: py => yMin + ((margin.t + height - py) / height) * span,
        handles: points,
      };
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [def, params, fn, show, view, handles, hover, dragging, colors]);

  function local(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { px: event.clientX - rect.left, py: event.clientY - rect.top };
  }

  /** 指定位置から一定距離内で最も近いハンドルの番号。 */
  function hit(event: PointerEvent<HTMLCanvasElement>): number | null {
    const g = geometry.current;
    if (!g) return null;
    const { px, py } = local(event);
    const reach = event.pointerType === 'touch' ? 20 : 12;
    let best: number | null = null;
    let bestDistance = reach;
    g.handles.forEach((h, i) => {
      const distance = Math.hypot(h.px - px, h.py - py);
      if (distance <= bestDistance) { best = i; bestDistance = distance; }
    });
    return best;
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const index = hit(event);
    if (index === null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setFrozen(view);
    setDragging(index);
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const g = geometry.current;
    if (dragging !== null && g) {
      const { px, py } = local(event);
      onDrag(dragging, g.invX(px), g.invY(py));
    } else {
      setHover(hit(event));
    }
  }

  function endDrag(event: PointerEvent<HTMLCanvasElement>) {
    if (dragging === null) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(null);
    setFrozen(null);
  }

  return (
    <canvas ref={canvasRef}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
      onPointerLeave={() => { if (dragging === null) setHover(null); }}
      style={{
        width: '100%', display: 'block', borderRadius: 6, background: colors.bg,
        cursor: dragging !== null ? 'grabbing' : hover !== null ? 'grab' : 'default',
        // ハンドルのあるフローでは、タッチ操作をページのスクロールではなくドラッグに使う。
        touchAction: handles.length > 0 ? 'none' : 'auto',
      }} />
  );
}
