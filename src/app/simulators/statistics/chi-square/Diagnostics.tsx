'use client';

import type { QuantilePoint, SampleStats } from './lib/types';

function Row({ label, sample, theory }: { label: string; sample: string; theory: string }) {
  return <div className="flex justify-between gap-2 leading-[1.7]">
    <span className="text-muted">{label}</span>
    <span className="text-fg">{sample} <span className="text-muted">/ {theory}</span></span>
  </div>;
}

export function Diagnostics({ stats, df, lambda, quantiles }: {
  stats: SampleStats; df: number; lambda: number; quantiles: QuantilePoint[];
}) {
  const mean = df + lambda;
  const variance = 2 * (df + 2 * lambda);
  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 mt-3 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">診断（標本 vs 理論）</div>
      <div className="font-mono text-[12px]">
        <Row label="平均" sample={stats.mean.toFixed(4)} theory={mean.toFixed(4)} />
        <Row label="分散" sample={stats.variance.toFixed(4)} theory={variance.toFixed(4)} />
      </div>
      <hr className="border-border my-3" />
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-1.5 font-semibold">理論分位点</div>
      <div className="grid grid-cols-5 gap-1 font-mono text-center">
        {quantiles.map(({ probability, value }) => (
          <div key={probability}>
            <div className="text-[10px] text-muted">{Math.round(probability * 100)}%</div>
            <div className="text-[11px] text-fg">{value.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <p className="text-muted text-[11.5px] leading-relaxed mt-2.5 mb-0">
        理論値は E[X] = ν + λ、Var[X] = 2(ν + 2λ)。λ = 0 で通常の中心 χ² 分布になります。
      </p>
    </div>
  );
}
