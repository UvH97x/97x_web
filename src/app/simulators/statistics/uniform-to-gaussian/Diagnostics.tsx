'use client';

import type { SampleStats } from './lib/types';

interface Props {
  stats: SampleStats;
  N: number;
}

function DiagRow({ label, sample, theory }: { label: string; sample: string; theory: string }) {
  return (
    <div className="flex justify-between gap-2 leading-[1.7]">
      <span className="text-muted">{label}</span>
      <span className="text-fg">
        {sample}{' '}
        <span className="text-muted">/ {theory}</span>
      </span>
    </div>
  );
}

export function Diagnostics({ stats, N }: Props) {
  const theoryKurt = (-6 / (5 * N)).toFixed(4);
  const truncBound = Math.sqrt(3 * N).toFixed(3);

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 mt-3 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        診断（標本 vs 理論）
      </div>

      <div className="font-mono text-[12px]">
        <DiagRow label="平均"     sample={stats.mean.toFixed(4)}   theory="0" />
        <DiagRow label="分散"     sample={stats.varr.toFixed(4)}   theory="1" />
        <DiagRow label="超過尖度" sample={stats.exKurt.toFixed(4)} theory={theoryKurt} />
        <div className="flex justify-between gap-2 leading-[1.7]">
          <span className="text-muted">打ち切り ±√(3N)</span>
          <span className="text-fg">{truncBound}</span>
        </div>
      </div>

      <p className="text-muted text-[11.5px] leading-relaxed mt-2.5 mb-0">
        超過尖度の理論値は −6/(5N)（裾が軽い platykurtic）。
        歪度は対称性から厳密に 0。標本値は M が増えるほど理論値に収束します。
      </p>
    </div>
  );
}
