/*
  * /src/app/layout.tsx
  * サイドバーとかヘッダーのレイアウトは、各アプリそれぞれで指定してあげてもいいかも。
  * コンテンツが増えたら、Google AdSenseを取り入れてみてもいいかも。
*/

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

import React from 'react';

import Header from '@/src/components/Header';
import './global.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className="h-full w-full">
      <body className="h-full w-full">
        <div className="flex-1 bg-gray-800 overflow-auto flex flex-col">
          <Header />
          <main className="flex-1 bg-white p-4 h-full overflow-y-auto">
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}