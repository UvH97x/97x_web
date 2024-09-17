import React from 'react';
import Link from 'next/link';
import { PageLink, PageLinks } from "../data/pageLinks" // リンクデータをインポート

const Sidebar: React.FC = () => {
  return (
    <nav className="flex flex-col gap-1">
      {PageLinks.map((link: PageLink) => (
        <Link href={link.href} key={link.href}>
          <div className="px-4 py-2 text-white bg-slate-700 rounded-lg hover:bg-slate-600 text-center">
            {link.label}
          </div>
        </Link>
      ))}
    </nav>
  );
};

export default Sidebar;