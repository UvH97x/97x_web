'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Tex } from '@/src/components/ui/Tex';
import { Controls } from './Controls';
import { DensityCanvas } from './DensityCanvas';
import { Diagnostics } from './Diagnostics';
import { FlowPicker } from './FlowPicker';
import { FunctionCanvas } from './FunctionCanvas';
import { getFlow, initialParams } from './lib/flows';
import {
  BASES, allowedBases, densityRange, functionGrid, generate, histogram, quantiles as baseQuantiles,
  roundTripError, sampleSummary, theorySummary,
} from './lib/model';
import { chooseBase, constrainScalars, defaultState, parseState, serializeState } from './lib/urlState';
import type { ExplorerState, ShowState } from './lib/types';

function Panel({ title, caption, children }: { title: string; caption: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-fg/5 border border-border rounded-[10px] p-[14px] min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
        <div className="text-[13px] font-semibold text-fg">{title}</div>
        <div className="text-[12.5px] text-muted max-w-full overflow-x-auto overflow-y-hidden">{caption}</div>
      </div>
      {children}
    </div>
  );
}

export function Explorer() {
  const searchParams = useSearchParams();
  // URL は最初に一度だけ読み、以後は状態が正で URL はその写しにする（下の effect）。
  const [state, setState] = useState<ExplorerState>(() => parseState(searchParams));

  useEffect(() => {
    // スライダーやドラッグは高頻度に発火し、ブラウザは履歴の更新回数を制限するので間引く。
    const timer = window.setTimeout(() => {
      const query = serializeState(state);
      const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
      if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, '', url);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state]);

  const patch = useCallback((change: Partial<ExplorerState>) => setState(previous => ({ ...previous, ...change })), []);
  const setShow = useCallback((key: keyof ShowState, value: boolean) =>
    setState(previous => ({ ...previous, show: { ...previous.show, [key]: value } })), []);
  const setScalar = useCallback((key: string, value: number) => setState(previous => {
    const def = getFlow(previous.flowId);
    const s = constrainScalars(def, { ...previous.params.s, [key]: value });
    const params = def.normalize({ s, v: previous.params.v }, previous.params);
    return { ...previous, params, base: chooseBase(def, params, previous.base) };
  }), []);
  const setVector = useCallback((key: string, index: number, value: number) => setState(previous => {
    const def = getFlow(previous.flowId);
    const vector = (previous.params.v[key] ?? []).slice();
    vector[index] = value;
    const params = def.normalize({ s: previous.params.s, v: { ...previous.params.v, [key]: vector } }, previous.params);
    return { ...previous, params };
  }), []);
  const drag = useCallback((index: number, x: number, y: number) => setState(previous => {
    const def = getFlow(previous.flowId);
    return def.drag ? { ...previous, params: def.drag(previous.params, index, x, y) } : previous;
  }), []);
  // パラメータはフローに属する。表示・標本の設定と、使えるなら基底分布は引き継ぐ。
  const setFlow = useCallback((id: string) => setState(previous => {
    const fresh = defaultState(id);
    const def = getFlow(fresh.flowId);
    return { ...previous, flowId: fresh.flowId, params: fresh.params, base: chooseBase(def, fresh.params, previous.base) };
  }), []);
  const reset = useCallback(() => setState(previous => {
    const def = getFlow(previous.flowId);
    const params = initialParams(def);
    return { ...previous, params, base: chooseBase(def, params, previous.base) };
  }), []);

  const def = getFlow(state.flowId);
  const { params, base, count, seed, bins, show } = state;

  const fn = useMemo(() => def.build(params), [def, params]);
  const allowed = useMemo(() => allowedBases(def, params), [def, params]);
  const samples = useMemo(() => generate(fn, base, count, seed), [fn, base, count, seed]);
  const sample = useMemo(() => sampleSummary(fn, samples.z, samples.y), [fn, samples]);
  const theory = useMemo(() => theorySummary(fn, base), [fn, base]);
  const quantiles = useMemo(() => baseQuantiles(fn, base), [fn, base]);
  const range = useMemo(() => densityRange(def, params, fn, base), [def, params, fn, base]);
  const hist = useMemo(() => histogram(samples.y, range, bins), [samples, range, bins]);
  const roundTrip = useMemo(() => roundTripError(fn, functionGrid(def, params)), [def, params, fn]);

  return (
    <div>
      <div className="mb-8">
        <PageHeader description={<>正規化フローで要素ごとに使われる狭義単調増加関数 g について、関数・逆関数・導関数と、
          基底分布 Z を Y = g(Z) で移したときの密度（変数変換の公式）を標本のヒストグラムと重ねて観察します。
          スプライン系の関数は、グラフ上の点をドラッグして形を変えられます。状態は URL に保存されるのでそのまま共有できます。</>}>
          正規化フロー: 要素別変換エクスプローラ
        </PageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,360px)] gap-3 mb-4">
          <FlowPicker value={def.id} onChange={setFlow} />
        </div>
        <div className="bg-fg/5 border border-border rounded-md px-3 py-2 text-[13.5px] text-fg flex flex-col gap-1.5">
          {([['順変換', def.formulas.forward], ['逆変換', def.formulas.inverse], ['微係数', def.formulas.derivative]] as const)
            .map(([label, source]) => (
              <div key={label} className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 text-[11px] text-muted w-[3.5em]">{label}</span>
                <div className="min-w-0 max-w-full overflow-x-auto overflow-y-hidden py-0.5">
                  <Tex>{`\\displaystyle ${source}`}</Tex>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_312px] gap-6 items-start">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
          <Panel title="関数 g(x)" caption={def.handles ? '点をドラッグして編集' : null}>
            <FunctionCanvas def={def} params={params} fn={fn} show={show} onDrag={drag} />
          </Panel>
          <Panel title={`変換後の密度（Z ~ ${BASES[base].label}）`}
            caption={<Tex>{String.raw`p_Y(y) = \frac{p_Z(g^{-1}(y))}{g'(g^{-1}(y))}`}</Tex>}>
            <DensityCanvas fn={fn} base={base} range={range} hist={hist} show={show} quantiles={quantiles} />
          </Panel>
        </div>
        <div>
          <Controls def={def} state={state} allowed={allowed}
            onScalar={setScalar} onVector={setVector} onPatch={patch} onShow={setShow} onReset={reset} />
          <Diagnostics def={def} params={params} sample={sample} theory={theory} quantiles={quantiles} roundTrip={roundTrip} />
        </div>
      </div>
    </div>
  );
}
