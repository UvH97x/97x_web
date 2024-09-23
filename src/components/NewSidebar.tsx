// /src/components/Sidebar.tsx

import Link from 'next/link';
import { PageLinks } from '../data/pageLinks';
import { PageLink } from '../types/UvHTypes';

function NewSidebar(isCollapsed: boolean){
  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'md:w-10' : 'md:w-32'} bg-slate-800 md:h-full flex md:flex-col flex-row`}>
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

export default NewSidebar;