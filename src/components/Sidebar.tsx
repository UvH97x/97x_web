// /src/components/Sidebar.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageLinks } from '../data/pageLinks';
import { PageLink } from '../types/UvHTypes';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // 折りたたみを切り替える関数
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'md:w-10' : 'md:w-32'} bg-slate-800 md:h-full flex md:flex-col flex-row`}>
      {/* サイドバーを折りたたむボタン */}
      <div className='md:w-8 md:h-8 md:px-1 md:py-3 md:block hidden'>
        <button
          onClick={toggleSidebar}
          className="text-white w-8 h-8 rounded-full focus:outline-none hover:bg-slate-600"
        >
          {/* ハンバーガーアイコンや矢印を表示 */}
          ≡
        </button>
      </div>
      

      {/* ナビゲーションリンク */}
      <nav className="flex-1 flex  md:flex-col md:justify-start flex-row gap-1 mt-4 justify-between">
        {PageLinks.map((link: PageLink) => (
          <Link href={link.href} key={link.href}>
            <div className="p-2 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center overflow-hidden">
              {/* アイコンがある場合はアイコンを表示し、ない場合はラベルだけを表示 */}
              {link.icon && <img src={link.icon} alt={`${link.label} icon`} className="w-6 h-6 mr-2" />}
              <span className="hidden md:block">{link.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
