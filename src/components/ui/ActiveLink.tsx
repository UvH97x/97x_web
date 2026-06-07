'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren } from "react"

type Props = PropsWithChildren<{ href: string }>

export function ActiveLink({ href, children }: Props) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${
        active
          ? 'font-semibold text-accent underline underline-offset-4'
          : 'text-fg hover:bg-fg/10'
      }`}
    >
      {children}
    </Link>
  )
}
