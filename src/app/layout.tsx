// layout.tsx
// アプリ全体の骨格を定義(App Shell)
// ヘッダー/フッターは常時表示
// main 内はページごとに入れ替わる

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import React from 'react';

import { Metadata } from 'next';
import { Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'

import '@/src/app/global.css';

import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'

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

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: { default: '97x', template: '%s | 97x' },
  description: '学習メモ・シミュレーター・Web アプリを公開しているサイトです。',
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      <body className={`${serif.variable} ${sans.variable} min-h-dvh bg-white text-slate-900 flex flex-col font-sans`}>
        <SiteHeader />

        {/* 残りスペースを占める（本文が短くても押し下げが効く） */}
        <main id="main" className="flex-1 py-8 sm:py-10">
          {children}
        </main>

        {/* 余白は上側だけ main でとる。フッターは常に最下部へ */}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}