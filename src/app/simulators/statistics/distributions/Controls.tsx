'use client';

import { useState, type ReactNode } from 'react';
import { RangeField } from '@/src/components/ui/RangeField';
import { formatValue, niceStep, stepDigits } from './lib/model';
import { LIMITS, paramMax } from './lib/urlState';
import type { DistributionDef, ExplorerState, Interval, PlotRange, ShowState } from './lib/types';

type ShowKey = keyof ShowState;

function SectionTitle({ children }: { children: ReactNode }) {
  return <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">{children}</div>;
}

/**
 * Typed entry for a slider's value. The draft is committed on Enter or blur and
 * clipped to [min, max]; unparsable input is discarded.
 */
function NumberInput({ label, text, min, max, integer, onCommit }: {
  label: string; text: string; min: number; max: number; integer: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit() {
    if (draft === null) return;
    // NFKC folds full-width digits and signs typed with a Japanese IME.
    const raw = draft.normalize('NFKC').replace(/[−ー]/g, '-').trim();
    const value = raw === '' ? Number.NaN : Number(raw);
    if (Number.isFinite(value)) {
      const clipped = Math.min(max, Math.max(min, value));
      onCommit(integer ? Math.round(clipped) : Number(clipped.toFixed(6)));
    }
    setDraft(null);
  }

  return (
    <input type="text" inputMode="decimal" autoComplete="off" spellCheck={false} aria-label={`${label}（数値入力）`}
      title={`${formatValue(min, 0)} 〜 ${formatValue(max, 0)}`}
      value={draft ?? text}
      onFocus={event => event.target.select()}
      onChange={event => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={event => {
        if (event.key === 'Enter') event.currentTarget.blur();
        else if (event.key === 'Escape') setDraft(null);
      }}
      className="w-[10ch] rounded border border-border bg-transparent px-1.5 py-px text-right font-mono text-[13px] text-accent hover:border-muted focus:border-accent focus:outline-none" />
  );
}

/**
 * A slider with a typed entry. The entry may use a different scale and range
 * than the slider (e.g. a logarithmic slider with a linear entry).
 */
function SliderRow({ label, sublabel, text, min, max, step, value, onChange, integer = false, entry }: {
  label: string; sublabel: string; text: string;
  min: number; max: number; step: number; value: number;
  onChange: (value: number) => void;
  integer?: boolean;
  entry?: { min: number; max: number; onCommit: (value: number) => void };
}) {
  return <RangeField layout="detailed" label={label} sublabel={sublabel}
    display={<NumberInput label={label} text={text} integer={integer}
      min={entry?.min ?? min} max={entry?.max ?? max} onCommit={entry?.onCommit ?? onChange} />}
    min={min} max={max} step={step} value={value} onValueChange={onChange} />;
}

interface Props {
  def: DistributionDef;
  state: ExplorerState;
  range: PlotRange;
  interval: Interval;
  onParam: (key: string, value: number) => void;
  onPatch: (patch: Partial<ExplorerState>) => void;
  onShow: (key: ShowKey, value: boolean) => void;
}

export function Controls({ def, state, range, interval, onParam, onPatch, onShow }: Props) {
  const { show, view } = state;
  const discrete = def.kind === 'discrete';
  const functionName = discrete ? 'PMF' : 'PDF';

  const overlays: { key: ShowKey; label: string; color: string }[] = [
    { key: 'hist', label: view === 'cdf' ? '経験分布関数（標本）' : discrete ? '標本の相対度数' : '標本ヒストグラム',
      color: 'rgb(var(--plot-hist))' },
    { key: 'theory', label: view === 'cdf' ? '理論 CDF' : `理論 ${functionName}`, color: 'rgb(var(--plot-ih))' },
    ...(def.reference ? [{ key: 'reference' as const, label: def.reference.label, color: 'rgb(var(--plot-gauss))' }] : []),
    { key: 'quantiles', label: '分位点（5–95%）', color: 'rgb(var(--fg))' },
    { key: 'interval', label: '区間確率 P(a ≤ X ≤ b)', color: 'rgb(var(--accent))' },
  ];

  // Interval sliders live on a round grid that covers the plot range; an endpoint
  // at (or beyond) the edge of the plot means "unbounded" on that side.
  const step = discrete ? 1 : niceStep((range.hi - range.lo) / 200);
  const digits = stepDigits(step);
  const sliderMin = Math.floor(range.lo / step) * step;
  const sliderMax = Math.ceil(range.hi / step) * step;
  const aValue = Number.isFinite(interval.a) ? interval.a : sliderMin;
  const bValue = Number.isFinite(interval.b) ? interval.b : sliderMax;
  const round = (value: number) => Number(value.toFixed(digits));

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <SectionTitle>表示する要素</SectionTitle>
      {overlays.map(({ key, label, color }) => (
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
      <SectionTitle>パラメータ</SectionTitle>
      {def.params.map(spec => (
        <SliderRow key={`${def.id}:${spec.key}`} label={spec.label} sublabel={spec.sublabel}
          text={formatValue(state.params[spec.key], spec.digits)}
          min={spec.min} max={paramMax(spec, state.params)} step={spec.step}
          integer={spec.digits === 0} value={state.params[spec.key]} onChange={value => onParam(spec.key, value)} />
      ))}

      {show.interval && (
        <>
          <hr className="border-border my-4" />
          <SectionTitle>区間 [a, b]</SectionTitle>
          <SliderRow label="下端 a" sublabel="左端で −∞"
            text={Number.isFinite(interval.a) ? formatValue(interval.a, digits) : '−∞'}
            min={sliderMin} max={sliderMax} step={step} value={aValue} integer={discrete}
            onChange={value => onPatch({ a: round(Math.min(value, bValue)) })}
            entry={{ min: sliderMin, max: sliderMax, onCommit: value => onPatch({ a: Math.min(value, bValue) }) }} />
          <SliderRow label="上端 b" sublabel="右端で +∞"
            text={Number.isFinite(interval.b) ? formatValue(interval.b, digits) : '+∞'}
            min={sliderMin} max={sliderMax} step={step} value={bValue} integer={discrete}
            onChange={value => onPatch({ b: round(Math.max(value, aValue)) })}
            entry={{ min: sliderMin, max: sliderMax, onCommit: value => onPatch({ b: Math.max(value, aValue) }) }} />
          <button type="button" onClick={() => onPatch({ a: null, b: null })} disabled={state.a === null && state.b === null}
            className="text-[12px] text-accent underline underline-offset-2 disabled:text-muted disabled:no-underline">
            四分位区間（25–75%）に戻す
          </button>
        </>
      )}

      <hr className="border-border my-4" />
      <SectionTitle>標本</SectionTitle>
      <SliderRow label="M" sublabel="生成サンプル数" text={String(state.count)} integer
        min={Math.log10(LIMITS.count.min)} max={Math.log10(LIMITS.count.max)} step={0.02}
        value={Math.log10(state.count)}
        onChange={value => onPatch({ count: Math.min(LIMITS.count.max, Math.round(10 ** value)) })}
        entry={{ min: LIMITS.count.min, max: LIMITS.count.max, onCommit: count => onPatch({ count }) }} />
      {!discrete && view === 'pdf' && (
        <SliderRow label="ビン数" sublabel="描画範囲の分割数" text={String(state.bins)} integer
          min={LIMITS.bins.min} max={LIMITS.bins.max} step={1} value={state.bins} onChange={bins => onPatch({ bins })} />
      )}
      <SliderRow label="乱数シード" sublabel="" text={String(state.seed)} integer
        min={LIMITS.seed.min} max={LIMITS.seed.max} step={1} value={state.seed} onChange={seed => onPatch({ seed })} />
    </div>
  );
}
