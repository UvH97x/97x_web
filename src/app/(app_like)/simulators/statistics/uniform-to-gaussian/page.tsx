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

  const samples = useMemo(() => generate(N, M, seed), [N, M, seed]);
  const stats   = useMemo(() => sampleStats(samples),  [samples]);
  const ihD     = useMemo(() => buildIrwinHall(N),     [N]);
  const R       = useMemo(() => plotRange(N),           [N]);
  const hist    = useMemo(() => histogram(samples, R, binW), [samples, R, binW]);

  return (
    <div className="max-w-[1160px] mx-auto px-5 py-[22px] pb-10">
      {/* ── Header ── */}
      <header className="mb-[18px]">
        <h1 className="text-[19px] font-semibold tracking-[0.2px] mb-1 text-fg">
          一様乱数からのガウス生成器
        </h1>
        <p className="text-muted text-[13px] leading-relaxed mb-2">
          N 個の一様乱数 u<sub>i</sub>~U(0,1) の和を標準化して g を作り、その分布を観察します。
          中心極限定理で N(0,1) に近づきますが、g は厳密には有界 [−√(3N), √(3N)] を持つ別の分布（標準化 Irwin–Hall）です。
        </p>
        <code className="font-mono text-accent bg-fg/5 border border-border rounded-md px-2.5 py-1.5 inline-block text-[13px]">
          g = ( Σ u<sub>i</sub> − N/2 ) / √(N/12)
        </code>
      </header>

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 min-[820px]:grid-cols-[1fr_312px] gap-[18px] items-start">
        {/* Plot card */}
        <div className="bg-fg/5 border border-border rounded-[10px] p-[14px]">
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

      {/* Slider thumb — inherits --accent from site theme */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px; height: 15px;
          border-radius: 50%;
          background: rgb(var(--accent));
          cursor: pointer;
          border: 2px solid rgb(var(--bg));
        }
        input[type=range]::-moz-range-thumb {
          width: 15px; height: 15px;
          border-radius: 50%;
          background: rgb(var(--accent));
          cursor: pointer;
          border: 2px solid rgb(var(--bg));
        }
      `}</style>
    </div>
  );
}
