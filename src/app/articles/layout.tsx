// src/app/articles/layout.tsx

"use client";


import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/src/components/Breadcrumbs'; // パスに応じて適宜調整

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // 現在のURLパスを取得

  return (
    <div className="flex flex-col gap-4">
      {/* パンくずリストを表示 */}
      <Breadcrumbs href={pathname} />
      <div>{children}</div>
    </div>
  );
}
