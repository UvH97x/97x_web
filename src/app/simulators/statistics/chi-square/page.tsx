'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Controls } from './Controls';
import { Diagnostics } from './Diagnostics';
import { PlotCanvas } from './PlotCanvas';
import { distributionQuantiles, generate, histogram, plotMax, sampleStats } from './lib/model';
import type { ShowState } from './lib/types';

const INIT = { df: 5, lambda: 4, count: 50_000, binW: 0.5, seed: 42 } as const;

export default function Page() {
  const [df, setDf] = useState<number>(INIT.df);
  const [lambda, setLambda] = useState<number>(INIT.lambda);
  const [count, setCount] = useState<number>(INIT.count);
  const [binW, setBinW] = useState<number>(INIT.binW);
  const [seed, setSeed] = useState<number>(INIT.seed);
  const [show, setShow] = useState<ShowState>({ hist: true, noncentral: true, central: true, quantiles: true });

  const samples = useMemo(() => generate(df, lambda, count, seed), [df, lambda, count, seed]);
  const stats = useMemo(() => sampleStats(samples), [samples]);
  const xMax = useMemo(() => plotMax(df, lambda), [df, lambda]);
  const hist = useMemo(() => histogram(samples, xMax, binW), [samples, xMax, binW]);
  const quantiles = useMemo(() => distributionQuantiles(df, lambda), [df, lambda]);

  return (
    <div>
      <div className="mb-8">
        <PageHeader description={<>自由度 ν と非心度 λ を持つ非心 χ² 分布を、乱数ヒストグラムと理論密度で観察します。
          λ = 0 にすると通常の中心 χ² 分布になり、赤い比較曲線と一致します。</>}>
          （非心）χ² 分布
        </PageHeader>
        <code className="font-mono text-accent bg-fg/5 border border-border rounded-md px-2.5 py-1.5 inline-block text-[13px]">
          X ~ χ²(ν, λ),　E[X] = ν + λ,　Var[X] = 2(ν + 2λ)
        </code>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_312px] gap-6 items-start">
        <div className="bg-fg/5 border border-border rounded-[10px] p-[14px]">
          <PlotCanvas df={df} lambda={lambda} hist={hist} show={show} xMax={xMax} quantiles={quantiles} />
        </div>
        <div>
          <Controls df={df} onDf={setDf} lambda={lambda} onLambda={setLambda}
            count={count} onCount={setCount} binW={binW} onBinW={setBinW} seed={seed} onSeed={setSeed}
            show={show} onShow={(key, value) => setShow(previous => ({ ...previous, [key]: value }))} />
          <Diagnostics stats={stats} df={df} lambda={lambda} quantiles={quantiles} />
        </div>
      </div>
    </div>
  );
}
