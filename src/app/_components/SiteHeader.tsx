import Link from "next/link";
import { ActiveLink } from "@/src/components/ui/ActiveLink";
import { NAV_ITEMS } from "@/src/config/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-3">

        {/* ワードマーク */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="" width={36} height={36} aria-hidden />
          <span className="font-serif font-bold text-xl leading-none">97x</span>
        </Link>

        {/* PC ナビ (md 以上) */}
        <nav className="hidden md:flex gap-1 text-sm" aria-label="メインナビゲーション">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <ActiveLink key={href} href={href}>
              <img src={icon} alt="" aria-hidden width={16} height={16} className="h-4 w-4" />
              {label}
            </ActiveLink>
          ))}
        </nav>

        {/* モバイル：ドロワー */}
        <details className="md:hidden">
          <summary className="cursor-pointer select-none text-sm">Menu</summary>
          <div className="absolute right-4 mt-2 w-48 rounded-lg border bg-white p-2 shadow">
            <nav className="flex flex-col gap-1 text-sm" aria-label="メインナビゲーション">
              {NAV_ITEMS.map(({ href, label, icon }) => (
                <ActiveLink key={href} href={href}>
                  <img src={icon} alt="" aria-hidden width={16} height={16} className="h-4 w-4" />
                  {label}
                </ActiveLink>
              ))}
            </nav>
          </div>
        </details>

      </div>
    </header>
  );
}
