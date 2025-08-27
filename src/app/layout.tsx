// layout.tsx
// アプリ全体の骨格を定義(App Shell)
// ヘッダー/フッターは常時表示
// main 内はページごとに入れ替わる

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import React from 'react';

import { Metadata } from 'next';

import '@/src/app/global.css';

import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'

type RootLayoutProps = {
  children: React.ReactNode;
};

// メタデータの生成
export const metadata: Metadata = {
  title: "97x",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja">
      {/* スマホ最適化 */}
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body className="min-h-dvh bg-white text-gray-900 flex flex-col">
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