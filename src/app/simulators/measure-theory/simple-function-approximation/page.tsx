'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { Controls } from './Controls';
import { PlotCanvas } from './PlotCanvas';
import { PointReadout } from './PointReadout';
import { TheoryNotes } from './TheoryNotes';
import { Tex } from '@/src/components/ui/Tex';
import { maxValue, presetById } from './lib/model';
import type { PresetId, ShowState } from './lib/types';

type ShowKey = keyof ShowState;

const DEFINITION = String.raw`f_n(x)=
\begin{cases}
\dfrac{k-1}{2^{n}}, & \dfrac{k-1}{2^{n}} \le f(x) < \dfrac{k}{2^{n}},\quad k=1,\dots,n2^{n},\\[1.2ex]
n, & f(x) \ge n.
\end{cases}`;

const LEGEND = [
  { label: 'f(x)', color: 'rgb(var(--plot-gauss))' },
  { label: 'fₙ(x)', color: 'rgb(var(--plot-hist))' },
];

export default function Page() {
  const [presetId, setPresetId] = useState<PresetId>('normal-pdf');
  const [n, setN] = useState(2);
  const [R, setR] = useState(1);
  const [sigma, setSigma] = useState(0.2);
  const [show, setShow] = useState<ShowState>({ levels: true, cap: true, history: false });
  const [hoverX, setHoverX] = useState<number | null>(null);

  const preset = presetById(presetId);
  const f = useMemo(() => (x: number) => preset.f(x, sigma), [preset, sigma]);
  const yTop = useMemo(() => {
    const peak = maxValue(f, R);
    return peak > 0 ? peak * 1.15 : 1;
  }, [f, R]);

  function handlePreset(id: PresetId) {
    setPresetId(id);
    setR(presetById(id).defaultR);
    setHoverX(null);
  }

  function handleShow(key: ShowKey, value: boolean) {
    setShow(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          description={
            <>
              非負可測函数 f を単函数列 f<sub>n</sub> で下から近似する構成を可視化します。
              n を動かすと値域の刻み幅 2<sup>−n</sup> が細かくなり、階段函数 f<sub>n</sub> が下側から f に近づいていきます。
            </>
          }
        >
          単函数近似 f<sub>n</sub> ↑ f
        </PageHeader>

        <div className="bg-fg/5 border border-border rounded-[10px] px-4 py-3">
          <div className="text-[15px] text-fg">
            <Tex display>{DEFINITION}</Tex>
          </div>
          <p className="text-muted text-[12px] leading-relaxed mt-2 mb-0">
            k は入力ではありません。各 x について f(x) &lt; n のとき{' '}
            <Tex>{String.raw`k(x)=\lfloor 2^{n} f(x)\rfloor + 1`}</Tex>{' '}
            と自動的に決まり、実装上は{' '}
            <Tex>{String.raw`f_n(x)=\min\!\left(n,\ \frac{\lfloor 2^{n} f(x)\rfloor}{2^{n}}\right)`}</Tex>{' '}
            と同値です。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div className="bg-fg/5 border border-border rounded-[10px] p-[14px]">
          <PlotCanvas
            f={f}
            n={n}
            R={R}
            yTop={yTop}
            show={show}
            hoverX={hoverX}
            onHoverX={setHoverX}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-[12px] text-muted">
            {LEGEND.map(item => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block rounded-[2px]"
                  style={{ width: '18px', height: '3px', background: item.color }}
                />
                {item.label}
              </span>
            ))}
            <span>薄い塗りは f<sub>n</sub> の下側領域（常に f 以下）</span>
          </div>
        </div>

        <div>
          <Controls
            preset={preset}
            onPreset={handlePreset}
            n={n} onN={setN}
            R={R} onR={setR}
            sigma={sigma} onSigma={setSigma}
            show={show} onShow={handleShow}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        <PointReadout x={hoverX} f={f} n={n} />
        <TheoryNotes n={n} />
      </div>
    </div>
  );
}
