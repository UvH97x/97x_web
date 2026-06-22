import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import { Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'
import { AppShell } from '@/src/app/_components/AppShell'
import '@/src/app/global.css'

// preload: false は必須 — 日本語フォントは subset が無く preload 不可
const serif = Noto_Serif_JP({
  weight: ['500', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-serif',
})
const sans = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: { default: '97x', template: '%s | 97x' },
  description: '学習メモ・シミュレーター・Web アプリを公開しているサイトです。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${serif.variable} ${sans.variable} min-h-dvh bg-bg text-fg flex flex-col font-sans`}>
        {/* FOUC 防止: ペイント前に dark クラスを付与 */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{var t=localStorage.getItem('theme');` +
          `var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);` +
          `document.documentElement.classList.toggle('dark',d);}catch(e){}})();`
        }} />
        <AppShell>
          {children}
        </AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
