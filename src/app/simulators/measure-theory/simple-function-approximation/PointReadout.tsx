'use client';

import { fracTex, fracText, pointInfo } from './lib/model';
import { Tex } from '@/src/components/ui/Tex';

interface Props {
  x: number | null;
  f: (x: number) => number;
  n: number;
}

const DASH = '—';

function Row({ label, value, idle }: { label: string; value: string; idle: boolean }) {
  return (
    <div className="flex justify-between gap-2 leading-[1.8]">
      <span className="text-muted">{label}</span>
      <span className={idle ? 'text-muted' : 'text-fg'}>{value}</span>
    </div>
  );
}

export function PointReadout({ x, f, n }: Props) {
  const info = x === null ? null : pointInfo(x, f(x), n);
  const idle = info === null;

  // The idle state keeps every row and line — only the values drop out — so the
  // card never changes height as the cursor enters and leaves the graph.
  const inequality = idle
    ? String.raw`\frac{k-1}{2^{n}} \le f(x) < \frac{k}{2^{n}}`
    : info.k === null
      ? `f(x) \\ge n = ${n} \\quad(\\text{truncation})`
      : `${fracTex(info.k - 1, n)} \\le f(x) < ${fracTex(info.k, n)}`;

  const hint = idle
    ? 'グラフ上にカーソルを合わせる（タッチする）と、その x での値を表示します。グラフをフォーカスして左右キーでも動かせます。'
    : info.k === null
      ? `f(x) が上端 n = ${n} 以上なので、k は使わず fₙ(x) = ${n} に切り詰められています。`
      : 'k は「f(x) が値域のどの小区間に入ったか」を表す添字です。x を動かすと k が切り替わり、fₙ が階段状になります。';

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-2.5 font-semibold">
        点ごとの情報
      </div>

      <div className="font-mono text-[12px]">
        <Row label="x"    value={idle ? DASH : info.x.toFixed(3)}  idle={idle} />
        <Row label="f(x)" value={idle ? DASH : info.fx.toFixed(4)} idle={idle} />
        <Row label="n"    value={String(n)}                        idle={false} />
        <Row label="Δ"    value={fracText(1, n)}                   idle={false} />
        <Row label="k"    value={idle || info.k === null ? DASH : String(info.k)} idle={idle} />
      </div>

      {/* min-h holds the row steady: the truncation branch has no fraction to render. */}
      <div className={`my-2.5 flex min-h-[40px] items-center text-[13px] ${idle ? 'text-muted' : 'text-fg'}`}>
        <Tex display>{inequality}</Tex>
      </div>

      <div className="font-mono text-[12px]">
        <Row
          label="fₙ(x)"
          value={idle ? DASH : info.k === null ? String(n) : `${fracText(info.k - 1, n)} = ${info.fn.toFixed(4)}`}
          idle={idle}
        />
        <Row
          label="f(x) − fₙ(x)"
          value={idle ? DASH : (info.fx - info.fn).toFixed(4)}
          idle={idle}
        />
      </div>

      <p className="text-muted text-[11.5px] leading-relaxed mt-2.5 mb-0 min-h-[3.8em]">
        {hint}
      </p>
    </div>
  );
}
