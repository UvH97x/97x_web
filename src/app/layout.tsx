/*
  * /src/app/layout.tsx
*/

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
      <body className="h-full w-full flex flex-col">
        <div className="bg-gray-800 sticky top-0">
          <Header />
        </div>
        <div className="flex-1 bg-gray-800 overflow-auto flex flex-row">
          <div className="w-32 p-1.5 overflow-y-auto overflow-x-hidden">
            <Sidebar />
          </div>
          <main className="flex-1 bg-gray-200 p-4 h-full overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
