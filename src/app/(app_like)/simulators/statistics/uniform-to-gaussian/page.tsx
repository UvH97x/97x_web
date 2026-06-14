'use client';

import { useState, useMemo } from 'react';
import { PlotCanvas }  from './PlotCanvas';
import { Controls }    from './Controls';
import { Diagnostics } from './Diagnostics';
import {
  generate, buildIrwinHall, histogram, sampleStats, plotRange,
} from './lib/model';
import type { ShowState } from './lib/types';

type ShowKey = keyof ShowState;

const INIT = { N: 12, M: 50_000, seed: 42, binW: 0.2 } as const;

export default function Page() {
  const [N,    setN]    = useState<number>(INIT.N);
  const [M,    setM]    = useState<number>(INIT.M);
  const [seed, setSeed] = useState<number>(INIT.seed);
  const [binW, setBinW] = useState<number>(INIT.binW);
  const [show, setShow] = useState<ShowState>({ hist: true, ih: true, gauss: true });

  function handleShow(key: ShowKey, value: boolean) {
    setShow(prev => ({ ...prev, [key]: value }));
  }

  // Heavy computations — memoized on their respective dependencies
  const samples = useMemo(() => generate(N, M, seed), [N, M, seed]);
  const stats   = useMemo(() => sampleStats(samples),  [samples]);
  const ihD     = useMemo(() => buildIrwinHall(N),     [N]);
  const R       = useMemo(() => plotRange(N),           [N]);
  const hist    = useMemo(() => histogram(samples, R, binW), [samples, R, binW]);

  return (
    <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '22px 20px 40px', background: '#12161F', minHeight: '100vh', color: '#CAD3E2', fontFamily: 'system-ui,-apple-system,"Segoe UI",sans-serif' }}>
      {/* ── Header ── */}
      <header style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: '19px', fontWeight: 600, letterSpacing: '.2px', margin: '0 0 4px' }}>
          一様乱数からのガウス生成器
        </h1>
        <p style={{ color: '#6C7993', fontSize: '13px', lineHeight: '1.5', margin: '0 0 8px' }}>
          N 個の一様乱数 u<sub>i</sub>~U(0,1) の和を標準化して g を作り、その分布を観察します。
          中心極限定理で N(0,1) に近づきますが、g は厳密には有界 [−√(3N), √(3N)] を持つ別の分布（標準化 Irwin–Hall）です。
        </p>
        <code style={{
          fontFamily: 'ui-monospace,"SF Mono","JetBrains Mono",Menlo,monospace',
          color: '#5FB3CE', background: '#0E1422',
          border: '1px solid #20293B', borderRadius: '6px',
          padding: '6px 10px', display: 'inline-block', fontSize: '13px',
        }}>
          g = ( Σ u<sub>i</sub> − N/2 ) / √(N/12)
        </code>
      </header>

      {/* ── 2-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 312px', gap: '18px', alignItems: 'start' }}>
        {/* Plot */}
        <div style={{ background: '#1A2030', border: '1px solid #232C40', borderRadius: '10px', padding: '14px' }}>
          <PlotCanvas N={N} hist={hist} ihD={ihD} show={show} R={R} />
        </div>

        {/* Sidebar */}
        <div>
          <Controls
            N={N}    onN={setN}
            M={M}    onM={setM}
            binW={binW} onBinW={setBinW}
            seed={seed} onSeed={setSeed}
            show={show} onShow={handleShow}
          />
          <Diagnostics stats={stats} N={N} />
        </div>
      </div>

      {/* Responsive: stack on narrow screens */}
      <style>{`
        @media (max-width: 820px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px; height: 15px;
          border-radius: 50%;
          background: #5FB3CE;
          cursor: pointer;
          border: 2px solid #0C0F16;
        }
        input[type=range]::-moz-range-thumb {
          width: 15px; height: 15px;
          border-radius: 50%;
          background: #5FB3CE;
          cursor: pointer;
          border: 2px solid #0C0F16;
        }
      `}</style>
    </main>
  );
}
