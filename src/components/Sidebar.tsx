/*
  * /src/components/Sidebar.tsx
*/

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageLink, PageLinks } from '../data/pageLinks';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // 折りたたみを切り替える関数
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-10' : 'w-32'} bg-slate-800 h-full flex flex-col`}>
      {/* サイドバーを折りたたむボタン */}
      <div className='w-8 h-8 px-1 py-3'>
        <button
          onClick={toggleSidebar}
          className="text-white w-8 h-8 rounded-full focus:outline-none hover:bg-slate-600"
        >
          {/* ハンバーガーアイコンや矢印を表示 */}
          ≡
        </button>
      </div>
      

      {/* ナビゲーションリンク */}
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {PageLinks.map((link: PageLink) => (
          <Link href={link.href} key={link.href}>
            <div className="p-2 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center overflow-hidden">
              {/* アイコンがある場合はアイコンを表示し、ない場合はラベルだけを表示 */}
              {link.icon && <img src={link.icon} alt={`${link.label} icon`} className="w-6 h-6 mr-2" />}
              <span>{link.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
