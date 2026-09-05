// Container.tsx
// 全ページの外側余白・最大幅を一元管理。記事本文は内側で max-w-3xl に制限する。

import { PropsWithChildren } from 'react'

export function Container({ children }: PropsWithChildren) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
}
