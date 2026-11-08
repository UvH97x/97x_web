'use client';

import { Tex } from '@/src/components/ui/Tex';

/** §12 of the spec: the properties the picture is meant to make obvious. */
export function TheoryNotes({ n }: { n: number }) {
  const notes: { title: string; tex: string; body: string }[] = [
    {
      title: '下からの近似',
      tex: String.raw`0 \le f_n(x) \le f(x)`,
      body: '階段は必ず f の下側にあります（値を下側へ丸めているため）。',
    },
    {
      title: '丸め誤差',
      tex: `0 \\le f(x) - f_{${n}}(x) < \\frac{1}{2^{${n}}}`,
      body: `f(x) < ${n} の範囲では、誤差は刻み幅 1/2^${n} 未満に収まります。`,
    },
    {
      title: '切り詰め',
      tex: `f(x) \\ge ${n} \\;\\Longrightarrow\\; f_{${n}}(x) = ${n}`,
      body: '上端では階段が水平に張り付きます。n を大きくすればこの領域は消えていきます。',
    },
    {
      title: '極限',
      tex: String.raw`f_n(x) \uparrow f(x) \quad (n \to \infty)`,
      body: '各点で単調増加に収束します。n を 1 から 8 まで動かして確かめてください。',
    },
  ];

  return (
    <div className="bg-bg border border-border rounded-[10px] p-4 text-fg">
      <div className="text-[11px] tracking-[0.8px] uppercase text-muted mb-3 font-semibold">
        現在の n で成り立つ性質
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map(note => (
          <div key={note.title}>
            <div className="text-[12px] font-semibold text-fg mb-1">{note.title}</div>
            <div className="text-[13px]"><Tex display>{note.tex}</Tex></div>
            <p className="text-muted text-[11.5px] leading-relaxed mt-1 mb-0">{note.body}</p>
          </div>
        ))}
      </div>
      <p className="text-muted text-[11.5px] leading-relaxed mt-4 mb-0">
        要点：階段状になるのは x 軸を等分しているからではなく、
        <span className="text-fg">f の値域を幅 2⁻ⁿ で分割している</span>
        からです。x を決める → f(x) が決まる → f(x) が属する小区間で k が決まる → f<sub>n</sub>(x) = (k−1)/2ⁿ が決まる、という順序で読んでください。
      </p>
    </div>
  );
}
