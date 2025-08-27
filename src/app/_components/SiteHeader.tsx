// SiteHeader.tsx
// PC/スマホ共通のヘッダー(モバイルはハンバーガーで省スペース)
// 小さく始めるため、<details>でドロワーを実現
// 必要に応じて後ほど本格的なモーダル/アニメーションに差し替え可能

import { ActiveLink } from "@/src/components/ui/ActiveLink";
import Link from "next/link";

export function SiteHeader(){
  return(
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-4">
        {/* 左：ロゴ/サイト名 */}
        <Link href="/" className="font-semibold">
          <img src="/favicon.ico" width={32} height={32} />
        </Link>

        {/* PCナビ (sm以上で表示) */}
        <nav className="hidden sm:flex gap-4 text-sm">
          <ActiveLink href="/">Home</ActiveLink>
          <ActiveLink href="/about">About</ActiveLink>
          <ActiveLink href="/articles">Articles</ActiveLink>
          <ActiveLink href="/simulators">Simulators</ActiveLink>
          <ActiveLink href="/applications">Applications</ActiveLink>
          <ActiveLink href="/datas">Datas</ActiveLink>
        </nav>

        {/* モバイル：ドロワー */}
        <details className="sm:hidden">
          {/* summaryはボタン扱い */}
          <summary className="cursor-pointer select-none text-sm">Menu</summary>
          <div className="absolute right-4 mt-2 w-40 rounded-lg border bg-white p-2 shadow">
            <nav className="flex flex-col gap-2 text-sm">
              <ActiveLink href="/">Home</ActiveLink>
              <ActiveLink href="/about">About</ActiveLink>
              <ActiveLink href="/articles">Articles</ActiveLink>
              <ActiveLink href="/simulators">Simulators</ActiveLink>
              <ActiveLink href="/applications">Applications</ActiveLink>
              <ActiveLink href="/datas">Datas</ActiveLink>
            </nav>
          </div>
        </details>
      </div>
    </header>
  )
}