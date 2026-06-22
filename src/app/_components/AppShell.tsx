'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/src/config/nav'
import { ThemeToggle } from './ThemeToggle'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/sidebar:collapsed=([^;]+)/)
    if (match?.[1] === '1') setCollapsed(true)
  }, [])
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    document.cookie = `sidebar:collapsed=${next ? '1' : '0'}; path=/; max-age=31536000`
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex flex-col flex-1">

      {/* ─── トップバー ─── */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/90 backdrop-blur px-3">
        {/* モバイル: ハンバーガー */}
        <button
          className="md:hidden rounded p-1.5 transition-colors hover:bg-fg/10"
          onClick={() => setMobileOpen(true)}
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* デスクトップ: サイドバー折り畳みトグル */}
        <button
          className="hidden md:flex rounded p-1.5 transition-colors hover:bg-fg/10"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'サイドバーを展開' : 'サイドバーを折り畳む'}
        >
          {collapsed
            ? <Menu className="h-5 w-5" />
            : <X className="h-5 w-5" />
          }
        </button>
        {/* ワードマーク */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="" width={32} height={32} aria-hidden />
          <span className="font-serif font-bold text-xl leading-none">97x</span>
        </Link>
        {/* 右端 */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      {/* ─── コンテンツ行 ─── */}
      <div className="flex flex-1">
        {/* モバイルオーバーレイ */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}

        {/* サイドバーパネル */}
        <aside
          className={[
            // モバイル: fixed フルハイト (トップバーを覆う)
            'fixed inset-y-0 left-0 z-50',
            // デスクトップ: sticky (トップバー下から)
            'md:sticky md:top-14 md:z-auto md:h-[calc(100dvh-3.5rem)]',
            'flex flex-col border-r border-border bg-bg',
            'transition-[width,transform] duration-300 motion-reduce:transition-none',
            'w-56',
            collapsed ? 'md:w-16' : 'md:w-56',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
          aria-label="サイドナビゲーション"
        >
          {/* モバイル専用ヘッダー行 — トップバーとオーバーラップ */}
          <div className="md:hidden flex h-14 shrink-0 items-center border-b border-border px-3 justify-between">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
            >
              <img src="/favicon.ico" alt="" width={32} height={32} aria-hidden />
              <span className="font-serif font-bold text-xl leading-none">97x</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded p-1.5 transition-colors hover:bg-fg/10"
              aria-label="メニューを閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 overflow-y-auto p-2" aria-label="セクション">
            <ul className="flex flex-col gap-0.5">
              {NAV_ITEMS.map(({ href, label, icon }) => {
                const active = isActive(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        'flex items-center rounded px-3 py-2 text-sm transition-colors',
                        collapsed ? 'md:justify-center md:gap-0' : 'gap-3',
                        active
                          ? 'bg-fg/10 font-semibold text-accent'
                          : 'text-fg hover:bg-fg/5',
                      ].join(' ')}
                    >
                      <img
                        src={icon}
                        alt=""
                        aria-hidden
                        width={20}
                        height={20}
                        className="h-5 w-5 shrink-0 dark:invert"
                      />
                      <span className={collapsed ? 'md:sr-only' : ''}>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* メインコンテンツ列 */}
        <div className="flex flex-col flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
