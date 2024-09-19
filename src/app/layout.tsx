/*
  * /src/app/layout.tsx
*/

import { Analytics } from '@vercel/analytics/react';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './global.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className="h-full w-full">
      <body className="h-full w-full flex flex-row">
        <div className="bg-gray-800 sticky top-0">
          <Sidebar />
        </div>
        <div className="flex-1 bg-gray-800 overflow-auto flex flex-col">
          <Header />
          <main className="flex-1 bg-white p-4 h-full overflow-y-auto">
            {children}
            <Analytics />
          </main>
        </div>
      </body>
    </html>
  );
}
