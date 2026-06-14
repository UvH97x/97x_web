'use client';

import type { SampleStats } from './lib/types';

interface Props {
  stats: SampleStats;
  N: number;
}

function DiagRow({ label, sample, theory }: { label: string; sample: string; theory: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', lineHeight: '1.7' }}>
      <span style={{ color: '#6C7993' }}>{label}</span>
      <span style={{ color: '#CAD3E2' }}>
        {sample}{' '}
        <span style={{ color: '#6C7993' }}>/ {theory}</span>
      </span>
    </div>
  );
}

export function Diagnostics({ stats, N }: Props) {
  const theoryKurt = (-6 / (5 * N)).toFixed(4);
  const truncBound = Math.sqrt(3 * N).toFixed(3);

  return (
    <div style={{
      background: '#1A2030', border: '1px solid #232C40', borderRadius: '10px',
      padding: '16px 16px 18px', color: '#CAD3E2', marginTop: '12px',
    }}>
      <div style={{
        fontSize: '11px', letterSpacing: '.8px', textTransform: 'uppercase',
        color: '#6C7993', marginBottom: '10px', fontWeight: 600,
      }}>
        診断（標本 vs 理論）
      </div>

      <div style={{ fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace', fontSize: '12px' }}>
        <DiagRow label="平均"      sample={stats.mean.toFixed(4)}   theory="0" />
        <DiagRow label="分散"      sample={stats.varr.toFixed(4)}   theory="1" />
        <DiagRow label="超過尖度"  sample={stats.exKurt.toFixed(4)} theory={theoryKurt} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', lineHeight: '1.7' }}>
          <span style={{ color: '#6C7993' }}>打ち切り ±√(3N)</span>
          <span style={{ color: '#CAD3E2' }}>{truncBound}</span>
        </div>
      </div>

      <p style={{ color: '#6C7993', fontSize: '11.5px', lineHeight: '1.5', marginTop: '10px', marginBottom: 0 }}>
        超過尖度の理論値は −6/(5N)（裾が軽い platykurtic）。
        歪度は対称性から厳密に 0。標本値は M が増えるほど理論値に収束します。
      </p>
    </div>
  );
}
