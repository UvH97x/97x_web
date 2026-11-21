'use client';

import { SectionTitle, SliderRow } from '@/src/app/simulators/statistics/distributions/Controls';
import { BASES, formatValue } from './lib/model';
import { LIMITS } from './lib/urlState';
import type { BaseId, ExplorerState, FlowDef, ShowState, VectorSpec } from './lib/types';

type ShowKey = keyof ShowState;

/** 色見本付きのチェックボックス（分布エクスプローラの「表示する要素」と同じ見た目）。 */
function Toggle({ label, color, checked, onChange, dashed = false }: {
  label: string; color: string; checked: boolean; onChange?: (value: boolean) => void; dashed?: boolean;
}) {
  const fixed = onChange === undefined;
  return (
    <label className={`flex items-center gap-[9px] py-1 text-[13.5px] ${fixed ? '' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={checked} disabled={fixed} onChange={e => onChange?.(e.target.checked)} className="peer sr-only" />
      <span className="shrink-0 rounded-[3px]" style={{
        width: 26, height: 14, opacity: checked ? 1 : 0.28, transition: 'opacity .12s',
        background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 9px)` : color,
        border: '1px solid rgba(0,0,0,0.25)',
      }} />
      <span className="flex-1">{label}</span>
      {!fixed && (
        <span className="shrink-0 rounded-[4px] grid place-items-center peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
          style={{ width: 15, height: 15, border: `1.5px solid ${checked ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
            background: checked ? 'rgb(var(--accent))' : 'transparent' }}>
          {checked && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5"
            stroke="rgb(var(--bg))" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
      )}
    </label>
  );
}

function VectorSliders({ spec, state, onVector }: {
  spec: VectorSpec; state: ExplorerState; onVector: (key: string, index: number, value: number) => void;
}) {
  const values = state.params.v[spec.key] ?? [];
  const editable = values.map((_, i) => spec.editable?.(i, state.params) ?? true);
  if (!editable.some(Boolean)) return null;
  return (
    <>
      <hr className="border-border my-4" />
      <SectionTitle>{spec.title}</SectionTitle>
      {values.map((value, i) => {
        if (!editable[i]) return null;
        const label = spec.itemLabel(i, state.params);
        const text = formatValue(Number(value.toFixed(spec.digits)), spec.digits);
        return spec.log ? (
          <SliderRow key={`${spec.key}:${i}`} label={label} sublabel="" text={text}
            min={Math.log10(spec.min)} max={Math.log10(spec.max)} step={0.01} value={Math.log10(value)}
            onChange={exponent => onVector(spec.key, i, Number((10 ** exponent).toFixed(4)))}
            entry={{ min: spec.min, max: spec.max, onCommit: next => onVector(spec.key, i, next) }} />
        ) : (
          <SliderRow key={`${spec.key}:${i}`} label={label} sublabel="" text={text}
            min={spec.min} max={spec.max} step={spec.step} value={value}
            onChange={next => onVector(spec.key, i, next)} />
        );
      })}
    </>
  );
}

interface Props {
  def: FlowDef;
  state: ExplorerState;
  allowed: BaseId[];
  onScalar: (key: string, value: number) => void;
  onVector: (key: string, index: number, value: number) => void;
  onPatch: (patch: Partial<ExplorerState>) => void;
  onShow: (key: ShowKey, value: boolean) => void;
  onReset: () => void;
}

export function Controls({ def, state, allowed, onScalar, onVector, onPatch, onShow, onReset }: Props) {
  const { show, params } = state;
  const vectors = (def.vectors ?? []).filter(spec => spec.visible?.(params) ?? true);

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <SectionTitle>表示する要素</SectionTitle>
      <div className="text-[12px] text-muted mt-1">関数グラフ</div>
      <Toggle label="g(x)" color="rgb(var(--plot-ih))" checked />
      <Toggle label="逆関数 g⁻¹" color="rgb(var(--plot-gauss))" dashed checked={show.inverse} onChange={value => onShow('inverse', value)} />
      <Toggle label="導関数 g′（右軸）" color="rgb(var(--plot-hist))" checked={show.derivative} onChange={value => onShow('derivative', value)} />
      <Toggle label="恒等写像 y = x" color="rgb(var(--muted))" dashed checked={show.identity} onChange={value => onShow('identity', value)} />
      <div className="text-[12px] text-muted mt-2">密度グラフ</div>
      <Toggle label="変換後の密度 p_Y" color="rgb(var(--plot-ih))" checked={show.theory} onChange={value => onShow('theory', value)} />
      <Toggle label="標本 g(z) のヒストグラム" color="rgb(var(--plot-hist))" checked={show.hist} onChange={value => onShow('hist', value)} />
      <Toggle label="基底の密度 p_Z" color="rgb(var(--muted))" dashed checked={show.base} onChange={value => onShow('base', value)} />

      <hr className="border-border my-4" />
      <SectionTitle>基底分布 Z</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="基底分布">
        {(Object.keys(BASES) as BaseId[]).map(id => {
          const enabled = allowed.includes(id);
          return (
            <button key={id} type="button" aria-pressed={state.base === id} disabled={!enabled}
              title={enabled ? undefined : 'この関数の定義域に台が収まらない'}
              onClick={() => onPatch({ base: id })}
              className={`rounded-md border px-2 py-1.5 text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                state.base === id ? 'border-accent bg-accent text-bg font-semibold' : 'border-border text-fg enabled:hover:bg-fg/5'}`}>
              {BASES[id].label}
            </button>
          );
        })}
      </div>

      {(def.scalars.length > 0 || def.handles) && (
        <>
          <hr className="border-border my-4" />
          <SectionTitle>パラメータ</SectionTitle>
          {def.handles && (
            <p className="text-[12px] text-muted leading-relaxed mt-0 mb-3">
              グラフ上の点をドラッグして{def.polygon ? '係数 β_j を上下に' : 'ノット (x_j, y_j) を'}動かせる。
            </p>
          )}
          {def.scalars.map(spec => (
            <SliderRow key={`${def.id}:${spec.key}`} label={spec.label} sublabel={spec.sublabel}
              text={formatValue(params.s[spec.key], spec.digits)}
              min={spec.min} max={typeof spec.max === 'function' ? spec.max(params.s) : spec.max} step={spec.step}
              integer={spec.digits === 0} value={params.s[spec.key]} onChange={value => onScalar(spec.key, value)} />
          ))}
        </>
      )}

      {vectors.map(spec => <VectorSliders key={`${def.id}:${spec.key}`} spec={spec} state={state} onVector={onVector} />)}

      {(def.scalars.length > 0 || def.vectors) && (
        <button type="button" onClick={onReset}
          className="text-[12px] text-accent underline underline-offset-2">
          パラメータを既定値に戻す
        </button>
      )}

      <hr className="border-border my-4" />
      <SectionTitle>標本</SectionTitle>
      <SliderRow label="M" sublabel="生成サンプル数" text={String(state.count)} integer
        min={Math.log10(LIMITS.count.min)} max={Math.log10(LIMITS.count.max)} step={0.02}
        value={Math.log10(state.count)}
        onChange={value => onPatch({ count: Math.min(LIMITS.count.max, Math.round(10 ** value)) })}
        entry={{ min: LIMITS.count.min, max: LIMITS.count.max, onCommit: count => onPatch({ count }) }} />
      <SliderRow label="ビン数" sublabel="描画範囲の分割数" text={String(state.bins)} integer
        min={LIMITS.bins.min} max={LIMITS.bins.max} step={1} value={state.bins} onChange={bins => onPatch({ bins })} />
      <SliderRow label="乱数シード" sublabel="" text={String(state.seed)} integer
        min={LIMITS.seed.min} max={LIMITS.seed.max} step={1} value={state.seed} onChange={seed => onPatch({ seed })} />
    </div>
  );
}
