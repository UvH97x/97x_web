// layout.tsx

import React from 'react';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div id="article_like" className="mx-8 sm:mx-10">
      {children}
    </div>
  );
}