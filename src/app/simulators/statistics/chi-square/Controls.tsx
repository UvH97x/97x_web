'use client';

import { RangeField } from '@/src/components/ui/RangeField';
import type { ShowState } from './lib/types';

type ShowKey = keyof ShowState;

const OVERLAYS: { key: ShowKey; label: string; color: string }[] = [
  { key: 'hist', label: '生成ヒストグラム', color: 'rgb(var(--plot-hist))' },
  { key: 'noncentral', label: 'χ²(ν, λ) の理論密度', color: 'rgb(var(--plot-ih))' },
  { key: 'central', label: '中心 χ²(ν)（λ = 0）', color: 'rgb(var(--plot-gauss))' },
  { key: 'quantiles', label: '分位点（5–95%）', color: 'rgb(var(--fg))' },
];

interface Props {
  df: number; onDf: (value: number) => void;
  lambda: number; onLambda: (value: number) => void;
  count: number; onCount: (value: number) => void;
  binW: number; onBinW: (value: number) => void;
  seed: number; onSeed: (value: number) => void;
  show: ShowState;
  onShow: (key: ShowKey, value: boolean) => void;
}

function SliderRow({ label, sublabel, display, min, max, step, value, onChange }: {
  label: string; sublabel: string; display: string;
  min: number; max: number; step: number; value: number;
  onChange: (value: number) => void;
}) {
  return <RangeField layout="detailed" label={label} sublabel={sublabel} display={display}
    min={min} max={max} step={step} value={value} onValueChange={onChange} />;
}

export function Controls({ df, onDf, lambda, onLambda, count, onCount, binW, onBinW, seed, onSeed, show, onShow }: Props) {
  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">表示する曲線</div>
      {OVERLAYS.map(({ key, label, color }) => (
        <label key={key} className="flex items-center gap-[9px] py-1.5 cursor-pointer text-[13.5px]">
          <input type="checkbox" checked={show[key]} onChange={e => onShow(key, e.target.checked)} className="peer sr-only" />
          <span className="shrink-0 rounded-[3px]" style={{ width: 26, height: 14, background: color,
            opacity: show[key] ? 1 : 0.28, border: '1px solid rgba(0,0,0,0.25)', transition: 'opacity .12s' }} />
          <span className="flex-1">{label}</span>
          <span className="shrink-0 rounded-[4px] grid place-items-center peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
            style={{ width: 15, height: 15, border: `1.5px solid ${show[key] ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              background: show[key] ? 'rgb(var(--accent))' : 'transparent' }}>
            {show[key] && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5"
              stroke="rgb(var(--bg))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        </label>
      ))}

      <hr className="border-border my-4" />
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">パラメータ</div>
      <SliderRow label="自由度 ν" sublabel="degrees of freedom" display={String(df)} min={1} max={50} step={1} value={df} onChange={onDf} />
      <SliderRow label="非心度 λ" sublabel="noncentrality" display={lambda.toFixed(1)} min={0} max={50} step={0.5} value={lambda} onChange={onLambda} />
      <SliderRow label="M" sublabel="生成サンプル数" display={count.toLocaleString('en-US')} min={3} max={5.7} step={0.02}
        value={Math.log10(count)} onChange={value => onCount(Math.round(10 ** value))} />
      <SliderRow label="ビン幅" sublabel="x 単位" display={binW.toFixed(2)} min={0.1} max={2} step={0.1} value={binW} onChange={onBinW} />
      <SliderRow label="乱数シード" sublabel="" display={String(seed)} min={1} max={9999} step={1} value={seed} onChange={onSeed} />
    </div>
  );
}
