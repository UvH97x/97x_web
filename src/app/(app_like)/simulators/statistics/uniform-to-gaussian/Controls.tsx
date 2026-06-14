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

// Shared range-input style injected once
const rangeStyle: React.CSSProperties = {
  WebkitAppearance: 'none',
  appearance: 'none',
  width: '100%',
  height: '4px',
  background: '#2A3346',
  borderRadius: '3px',
  outline: 'none',
  cursor: 'pointer',
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px', letterSpacing: '.8px', textTransform: 'uppercase',
      color: '#6C7993', marginBottom: '10px', fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function SliderRow({
  label, sublabel, display, min, max, step, value, onChange,
}: {
  label: string; sublabel: string; display: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px' }}>
          {label}{' '}
          <span style={{ color: '#6C7993' }}>{sublabel}</span>
        </span>
        <span style={{ fontFamily: 'ui-monospace,"SF Mono",Menlo,monospace', fontSize: '13px', color: '#5FB3CE' }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={rangeStyle}
      />
    </div>
  );
}

export function Controls({ N, onN, M, onM, binW, onBinW, seed, onSeed, show, onShow }: Props) {
  const mLog = Math.log10(M);

  return (
    <div style={{
      background: '#1A2030', border: '1px solid #232C40', borderRadius: '10px',
      padding: '16px 16px 18px', color: '#CAD3E2',
    }}>
      {/* ── Overlay toggles ── */}
      <SectionLabel>表示する曲線</SectionLabel>
      {OVERLAYS.map(({ key, label, color }) => (
        <label
          key={key}
          style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '6px 0', cursor: 'pointer', fontSize: '13.5px' }}
        >
          <input
            type="checkbox"
            checked={show[key]}
            onChange={e => onShow(key, e.target.checked)}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
          />
          {/* color swatch */}
          <span style={{
            width: '26px', height: '14px', borderRadius: '3px', flexShrink: 0,
            background: color, opacity: show[key] ? 1 : 0.28,
            border: '1px solid rgba(0,0,0,0.25)',
            transition: 'opacity .12s',
          }} />
          <span style={{ flex: 1 }}>{label}</span>
          {/* checkmark box */}
          <span style={{
            width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0,
            border: `1.5px solid ${show[key] ? '#5FB3CE' : '#404B61'}`,
            background: show[key] ? '#5FB3CE' : 'transparent',
            display: 'grid', placeItems: 'center',
            transition: 'border-color .12s, background .12s',
          }}>
            {show[key] && (
              <svg width="9" height="9" viewBox="0 0 9 9">
                <path d="M1 4.5L3.5 7L8 1.5" stroke="#0C0F16" strokeWidth="1.8"
                  fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </label>
      ))}

      <hr style={{ border: 'none', borderTop: '1px solid #232C40', margin: '16px 0' }} />

      {/* ── Parameter sliders ── */}
      <SectionLabel>パラメータ</SectionLabel>

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
