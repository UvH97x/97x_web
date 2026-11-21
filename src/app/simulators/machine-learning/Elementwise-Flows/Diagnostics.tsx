'use client';

import type { SampleSummary } from './lib/model';
import type { FlowDef, FlowParams, QuantilePoint } from './lib/types';

function Row({ label, sample, theory }: { label: string; sample: string; theory?: string }) {
  return <div className="flex justify-between gap-2 leading-[1.7]">
    <span className="text-muted">{label}</span>
    <span className="text-fg">{sample}{theory !== undefined && <span className="text-muted"> / {theory}</span>}</span>
  </div>;
}

const show = (value: number) => (Number.isFinite(value) ? value.toFixed(4) : value > 0 ? '∞' : value < 0 ? '−∞' : '—');

interface Props {
  def: FlowDef;
  params: FlowParams;
  sample: SampleSummary;
  theory: SampleSummary;
  quantiles: QuantilePoint[];
  roundTrip: number;
}

export function Diagnostics({ def, params, sample, theory, quantiles, roundTrip }: Props) {
  const table = def.coefficients?.(params) ?? null;
  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 mt-3 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">診断（標本 / 数値積分）</div>
      <div className="font-mono text-[12px]">
        <Row label="平均 E[Y]" sample={show(sample.mean)} theory={show(theory.mean)} />
        <Row label="分散 Var[Y]" sample={show(sample.variance)} theory={show(theory.variance)} />
        <Row label="E[log g′(Z)]" sample={show(sample.logDet)} theory={show(theory.logDet)} />
        <Row label="max|g⁻¹(g(x))−x|" sample={roundTrip.toExponential(1)} />
      </div>
      <p className="text-muted text-[11px] leading-relaxed mt-1.5 mb-0">
        E[log g′(Z)] は対数尤度 log p_Y(g(z)) = log p_Z(z) − log g′(z) のヤコビアン項の平均。
      </p>
      <hr className="border-border my-3" />
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-1.5 font-semibold">分位点 Y = g(Z)</div>
      <div className="grid grid-cols-5 gap-1 font-mono text-center">
        {quantiles.map(({ probability, y }) => (
          <div key={probability}>
            <div className="text-[10px] text-muted">{Math.round(probability * 100)}%</div>
            <div className="text-[11px] text-fg">{Number.isFinite(y) ? y.toFixed(2) : '—'}</div>
          </div>
        ))}
      </div>
      {table && (
        <details className="mt-3">
          <summary className="text-[12px] text-muted cursor-pointer select-none">{table.title}</summary>
          <div className="mt-1.5 max-h-64 overflow-auto">
            <table className="w-full font-mono text-[11px] text-right">
              <thead>
                <tr className="text-muted">{table.header.map(cell => <th key={cell} className="font-normal px-1 py-0.5">{cell}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map(row => (
                  <tr key={row[0]} className="border-t border-border">
                    {row.map((cell, i) => <td key={i} className="px-1 py-0.5">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <p className="text-muted text-[11.5px] leading-relaxed mt-2.5 mb-0">{def.note}</p>
    </div>
  );
}
