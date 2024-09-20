/*
  * /src/app/layout.tsx
*/

import { Analytics } from '@vercel/analytics/react';

import React from 'react';

import Sidebar from '@/src/components/Sidebar';
import Header from '@/src/components/Header';
import './global.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className="h-full w-full">
      <body className="h-full w-full overflow-hidden flex flex-col-reverse md:flex-row">
        <div className="bg-gray-800 sticky top-0 md:static md:block">
          <Sidebar />
        </div>
        <div className="flex-1 bg-gray-800 overflow-auto flex flex-col">
          <Header />
          <main className="flex-1 bg-white p-4 h-full overflow-y-auto">
            {children}
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}