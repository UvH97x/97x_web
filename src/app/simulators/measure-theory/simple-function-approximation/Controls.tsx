'use client';

import { RangeField } from '@/src/components/ui/RangeField';
import { SelectField } from '@/src/components/ui/SelectField';
import { PRESETS } from './lib/model';
import { Tex } from '@/src/components/ui/Tex';
import type { Preset, PresetId, ShowState } from './lib/types';

type ShowKey = keyof ShowState;

const OVERLAYS: { key: ShowKey; label: string; color: string }[] = [
  { key: 'levels',  label: '値域の分割線 j/2ⁿ',       color: 'rgb(var(--plot-hist))' },
  { key: 'cap',     label: '上端 y = n',               color: 'rgb(var(--plot-ih))' },
  { key: 'history', label: 'f₁ … f₍ₙ₋₁₎ を重ねる',     color: 'rgb(var(--muted))' },
];

interface Props {
  preset: Preset;
  onPreset: (id: PresetId) => void;
  n: number;      onN: (v: number) => void;
  R: number;      onR: (v: number) => void;
  sigma: number;  onSigma: (v: number) => void;
  show: ShowState;
  onShow: (key: ShowKey, value: boolean) => void;
}

function Toggle({ label, color, checked, onChange }: {
  label: string; color: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-[9px] py-1.5 cursor-pointer text-[13.5px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="peer sr-only"
      />
      {/* visualization color swatch — data encoding, not a theme token */}
      <span
        className="shrink-0 rounded-[3px]"
        style={{
          width: '26px', height: '14px',
          background: color,
          opacity: checked ? 1 : 0.28,
          border: '1px solid rgba(0,0,0,0.25)',
          transition: 'opacity .12s',
        }}
      />
      <span className="flex-1">{label}</span>
      <span
        className="shrink-0 rounded-[4px] grid place-items-center peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
        style={{
          width: '15px', height: '15px',
          border: `1.5px solid ${checked ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
          background: checked ? 'rgb(var(--accent))' : 'transparent',
          transition: 'border-color .12s, background .12s',
        }}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 9 9">
            <path d="M1 4.5L3.5 7L8 1.5" stroke="rgb(var(--bg))" strokeWidth="1.8"
              fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </label>
  );
}

export function Controls({ preset, onPreset, n, onN, R, onR, sigma, onSigma, show, onShow }: Props) {
  const options = PRESETS.map(p => ({ value: p.id, label: p.label }));

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        極限函数 f
      </div>

      <SelectField
        label="函数"
        value={preset.id}
        options={options}
        onValueChange={onPreset}
        hint={preset.note}
      />

      <div className="mt-2 text-[13px] text-fg">
        <Tex display>{preset.tex}</Tex>
      </div>

      <hr className="border-border my-4" />

      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        パラメータ
      </div>

      <RangeField
        layout="detailed"
        label="n" sublabel="分割の細かさ"
        display={String(n)}
        min={1} max={8} step={1} value={n}
        onValueChange={onN}
      />
      <p className="-mt-2 mb-4 text-[11.5px] leading-relaxed text-muted">
        <Tex>{`\\Delta_{${n}} = \\frac{1}{2^{${n}}} = \\frac{1}{${2 ** n}}`}</Tex>
        {' '}の幅で値域を下側に量子化し、f(x) ≥ {n} の部分は {n} に切り詰めます。
      </p>

      <RangeField
        layout="detailed"
        label="表示範囲" sublabel="x ∈ [−R, R]"
        display={`R = ${R.toFixed(1)}`}
        min={0.5} max={6} step={0.5} value={R}
        onValueChange={onR}
      />

      {preset.usesSigma && (
        <RangeField
          layout="detailed"
          label="σ" sublabel="正規密度の標準偏差"
          display={sigma.toFixed(2)}
          min={0.1} max={1} step={0.05} value={sigma}
          onValueChange={onSigma}
        />
      )}

      <hr className="border-border my-4" />

      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        補助表示
      </div>
      {OVERLAYS.map(({ key, label, color }) => (
        <Toggle
          key={key}
          label={label}
          color={color}
          checked={show[key]}
          onChange={v => onShow(key, v)}
        />
      ))}
    </div>
  );
}
