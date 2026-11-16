'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Tex } from '@/src/components/ui/Tex';
import { Controls } from './Controls';
import { DistributionPicker } from './DistributionPicker';
import { Diagnostics } from './Diagnostics';
import { PlotCanvas } from './PlotCanvas';
import { getDistribution } from './lib/distributions';
import {
  distributionQuantiles, generate, histogram, intervalProbability, plotRange, resolveInterval,
  sampleIntervalProportion, sampleStats,
} from './lib/model';
import { constrainParams, defaultState, parseState, serializeState } from './lib/urlState';
import type { ExplorerState, ShowState, View } from './lib/types';

export function Explorer() {
  const searchParams = useSearchParams();
  // The URL is read once; afterwards the state is the source of truth and the
  // URL just mirrors it (see the effect below).
  const [state, setState] = useState<ExplorerState>(() => parseState(searchParams));

  useEffect(() => {
    // Debounced: browsers rate-limit history updates, and sliders fire rapidly.
    const timer = window.setTimeout(() => {
      const query = serializeState(state);
      const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
      if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, '', url);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state]);

  const patch = useCallback((change: Partial<ExplorerState>) => setState(previous => ({ ...previous, ...change })), []);
  // Re-clamps all parameters: the limits of some depend on the one that changed.
  const setParam = useCallback((key: string, value: number) => setState(previous => ({
    ...previous,
    params: constrainParams(getDistribution(previous.distId), { ...previous.params, [key]: value }),
  })), []);
  const setShow = useCallback((key: keyof ShowState, value: boolean) =>
    setState(previous => ({ ...previous, show: { ...previous.show, [key]: value } })), []);
  // Parameters and the interval belong to a distribution; display and sampling settings carry over.
  const setDistribution = useCallback((id: string) => setState(previous => {
    const fresh = defaultState(id);
    return { ...previous, distId: fresh.distId, params: fresh.params, a: null, b: null };
  }), []);

  const def = getDistribution(state.distId);
  const { params, count, seed, bins, view, show } = state;

  const samples = useMemo(() => generate(def, params, count, seed), [def, params, count, seed]);
  const stats = useMemo(() => sampleStats(samples), [samples]);
  const range = useMemo(() => plotRange(def, params), [def, params]);
  const quantiles = useMemo(() => distributionQuantiles(def, params), [def, params]);
  const hist = useMemo(() => (view === 'pdf' ? histogram(samples, def, range, bins) : null), [view, samples, def, range, bins]);
  const sorted = useMemo(() => (view === 'cdf' ? Float64Array.from(samples).sort() : null), [view, samples]);
  const interval = useMemo(() => resolveInterval(def, range, quantiles, state.a, state.b), [def, range, quantiles, state.a, state.b]);
  const intervalInfo = useMemo(() => (show.interval ? {
    range: interval,
    theory: intervalProbability(def, params, interval),
    sample: sampleIntervalProportion(samples, interval),
  } : null), [show.interval, interval, def, params, samples]);

  return (
    <div>
      <div className="mb-8">
        <PageHeader description={<>基本的な確率分布の密度関数・確率質量関数と累積分布関数を、乱数標本と重ねて観察します。
          パラメータや区間はスライダーで操作でき、状態は URL に保存されるのでそのまま共有できます。</>}>
          確率分布エクスプローラ
        </PageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,320px)_minmax(0,320px)] gap-x-6 gap-y-3 items-end mb-4">
          <DistributionPicker value={def.id} onChange={setDistribution} />
          <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="表示する関数">
            {([['pdf', def.kind === 'discrete' ? '確率質量 PMF' : '密度 PDF'], ['cdf', '累積分布 CDF']] as [View, string][]).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={view === key} onClick={() => patch({ view: key })}
                className={`rounded-md border px-2 py-1.5 text-sm transition-colors ${
                  view === key ? 'border-accent bg-accent text-bg font-semibold' : 'border-border text-fg hover:bg-fg/5'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-fg/5 border border-border rounded-md px-3 py-2 text-[13.5px] text-fg text-center flex flex-wrap items-center justify-center gap-x-10 gap-y-1.5">
          {[def.formula, def.moments].map(source => (
            <div key={source} className="max-w-full overflow-x-auto overflow-y-hidden py-0.5">
              <Tex>{`\\displaystyle ${source}`}</Tex>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_312px] gap-6 items-start">
        <div className="bg-fg/5 border border-border rounded-[10px] p-[14px]">
          <PlotCanvas def={def} params={params} view={view} range={range} hist={hist} sorted={sorted}
            show={show} quantiles={quantiles} interval={interval} />
        </div>
        <div>
          <Controls def={def} state={state} range={range} interval={interval}
            onParam={setParam} onPatch={patch} onShow={setShow} />
          <Diagnostics def={def} params={params} stats={stats} quantiles={quantiles} interval={intervalInfo} />
        </div>
      </div>
    </div>
  );
}
