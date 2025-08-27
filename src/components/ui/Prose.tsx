// Prose.tsx
// 記事本文の読みやすいタイポグラフィ(Tailwindのproseを1カ所に集約)
// 今後、図番号や式番号などのCSS調整もここでやると一元化できる。

import { PropsWithChildren } from "react";

export function Prose({ children }: PropsWithChildren){
  return (
    <article className="prose max-w-none text-slate-900">
      {children}
    </article>
  )
}