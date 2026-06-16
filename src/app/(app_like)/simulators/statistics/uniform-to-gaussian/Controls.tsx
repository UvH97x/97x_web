'use client';

import type { ShowState } from './lib/types';

type ShowKey = keyof ShowState;

const OVERLAYS: { key: ShowKey; label: string; color: string }[] = [
  { key: 'hist',  label: '生成ヒストグラム',        color: '#3E5A74' },
  { key: 'ih',    label: '厳密分布 (Irwin–Hall)',    color: '#E8B84B' },
  { key: 'gauss', label: '目標 N(0,1)',              color: '#E06C75' },
];

interface Props {
  N: number;     onN:    (v: number) => void;
  M: number;     onM:    (v: number) => void;
  binW: number;  onBinW: (v: number) => void;
  seed: number;  onSeed: (v: number) => void;
  show: ShowState;
  onShow: (key: ShowKey, value: boolean) => void;
}

function SliderRow({
  label, sublabel, display, min, max, step, value, onChange,
}: {
  label: string; sublabel: string; display: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-[15px]">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[13px] text-fg">
          {label}{' '}
          <span className="text-muted">{sublabel}</span>
        </span>
        <span className="font-mono text-[13px] text-accent">{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-[4px] rounded-[3px] outline-none cursor-pointer appearance-none"
        style={{ background: 'rgb(var(--fg) / 0.15)' }}
      />
    </div>
  );
}

export function Controls({ N, onN, M, onM, binW, onBinW, seed, onSeed, show, onShow }: Props) {
  const mLog = Math.log10(M);

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      {/* ── Overlay toggles ── */}
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        表示する曲線
      </div>
      {OVERLAYS.map(({ key, label, color }) => (
        <label
          key={key}
          className="flex items-center gap-[9px] py-1.5 cursor-pointer text-[13.5px]"
        >
          <input
            type="checkbox"
            checked={show[key]}
            onChange={e => onShow(key, e.target.checked)}
            className="absolute opacity-0 w-0 h-0"
          />
          {/* visualization color swatch — kept as-is (data encoding) */}
          <span
            className="shrink-0 rounded-[3px]"
            style={{
              width: '26px', height: '14px',
              background: color,
              opacity: show[key] ? 1 : 0.28,
              border: '1px solid rgba(0,0,0,0.25)',
              transition: 'opacity .12s',
            }}
          />
          <span className="flex-1">{label}</span>
          {/* checkmark box */}
          <span
            className="shrink-0 rounded-[4px] grid place-items-center"
            style={{
              width: '15px', height: '15px',
              border: `1.5px solid ${show[key] ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
              background: show[key] ? 'rgb(var(--accent))' : 'transparent',
              transition: 'border-color .12s, background .12s',
            }}
          >
            {show[key] && (
              <svg width="9" height="9" viewBox="0 0 9 9">
                <path d="M1 4.5L3.5 7L8 1.5" stroke="rgb(var(--bg))" strokeWidth="1.8"
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </label>
      ))}

      <hr className="border-border my-4" />

      {/* ── Parameter sliders ── */}
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        パラメータ
      </div>

      <SliderRow
        label="N" sublabel="足し合わせる個数"
        display={String(N)}
        min={1} max={50} step={1} value={N}
        onChange={onN}
      />
      <SliderRow
        label="M" sublabel="生成サンプル数"
        display={M.toLocaleString('en-US')}
        min={2} max={6} step={0.02} value={mLog}
        onChange={v => onM(Math.round(Math.pow(10, v)))}
      />
      <SliderRow
        label="ビン幅" sublabel="(σ単位)"
        display={binW.toFixed(2)}
        min={0.05} max={1.0} step={0.05} value={binW}
        onChange={onBinW}
      />
      <SliderRow
        label="乱数シード" sublabel=""
        display={String(seed)}
        min={1} max={9999} step={1} value={seed}
        onChange={onSeed}
      />
    </div>
  );
}
