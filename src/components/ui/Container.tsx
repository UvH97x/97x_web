// Container.tsx
// 横幅・左右余白を一元管理するコンテナ
// レイアウトの最大幅を一か所で調整できる

import { PropsWithChildren } from 'react'

export function Container({ children }: PropsWithChildren) {
  // モバイルは左右px-4、PCはmax-w-3xlで読みやすい幅に制限
  return <div className="mx-auto w-full max-w-3xl px-4">{children}</div>
}