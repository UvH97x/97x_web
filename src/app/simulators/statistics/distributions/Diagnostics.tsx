'use client';

import type { DistributionDef, Interval, Params, QuantilePoint, SampleStats } from './lib/types';

function Row({ label, sample, theory }: { label: string; sample: string; theory: string }) {
  return <div className="flex justify-between gap-2 leading-[1.7]">
    <span className="text-muted">{label}</span>
    <span className="text-fg">{sample} <span className="text-muted">/ {theory}</span></span>
  </div>;
}

function intervalLabel({ a, b }: Interval, digits: number): string {
  const lower = Number.isFinite(a);
  const upper = Number.isFinite(b);
  if (lower && upper) return `P(${a.toFixed(digits)} ≤ X ≤ ${b.toFixed(digits)})`;
  if (upper) return `P(X ≤ ${b.toFixed(digits)})`;
  if (lower) return `P(X ≥ ${a.toFixed(digits)})`;
  return 'P(−∞ < X < ∞)';
}

/** A theoretical moment: null when it does not exist, possibly infinite. */
function moment(value: number | null): string {
  if (value === null) return '未定義';
  return Number.isFinite(value) ? value.toFixed(4) : value > 0 ? '∞' : '−∞';
}

interface Props {
  def: DistributionDef;
  params: Params;
  stats: SampleStats;
  quantiles: QuantilePoint[];
  /** 区間確率を表示しないときは null。 */
  interval: { range: Interval; sample: number; theory: number } | null;
}

export function Diagnostics({ def, params, stats, quantiles, interval }: Props) {
  const mean = def.mean(params);
  const variance = def.variance(params);
  const discrete = def.kind === 'discrete';
  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 mt-3 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">診断（標本 / 理論）</div>
      <div className="font-mono text-[12px]">
        <Row label="平均" sample={stats.mean.toFixed(4)} theory={moment(mean)} />
        <Row label="分散" sample={stats.variance.toFixed(4)} theory={moment(variance)} />
        {interval && (
          <Row label={intervalLabel(interval.range, discrete ? 0 : 2)}
            sample={interval.sample.toFixed(4)} theory={interval.theory.toFixed(4)} />
        )}
      </div>
      <hr className="border-border my-3" />
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-1.5 font-semibold">理論分位点</div>
      <div className="grid grid-cols-5 gap-1 font-mono text-center">
        {quantiles.map(({ probability, value }) => (
          <div key={probability}>
            <div className="text-[10px] text-muted">{Math.round(probability * 100)}%</div>
            <div className="text-[11px] text-fg">{value.toFixed(discrete ? 0 : 2)}</div>
          </div>
        ))}
      </div>
      {def.note && <p className="text-muted text-[11.5px] leading-relaxed mt-2.5 mb-0">{def.note}</p>}
    </div>
  );
}
