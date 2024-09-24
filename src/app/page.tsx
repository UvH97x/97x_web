/*
  * src/app/page.tsx
*/

import React from 'react';

import { PageLink } from '../types/UvHTypes';
import LinkBlock from '../components/LinkBlock';

// メタデータの生成
export async function generateMetadata() {
  return {
    title: "97x Home",
    description: "97x Top Page",
  };
}

function HomePage() {
  const Links: PageLink[] = [
    {
      href: "/articles",
      label: "Articles",
      sublinks: [],
      icon: "/articles.svg",
    },
    {
      href: "/applications",
      label: "Apps",
      sublinks: [
        { href: "/applications/todo", label: "Todo", sublinks: [] }
      ],
      icon: "/apps.svg",
    },
    {
      href: "/simulators",
      label: "Simulators",
      sublinks: [],
      icon: "/simulators.svg",
    },
  ];

  return (
    <div className="flex flex-col items-center p-0">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-8 text-slate-900">
        Welcome to 97x
      </h1>
  
      {/* 説明文 */}
      <div className="text-lg text-gray-700 mb-8">
        <p>
          This website was created for the purpose of storing my notes on matters I struggled with in my studies, simulators I created, etc. Also, I am still in the process of learning and have never created a website before, so please forgive me for any mistakes I may have made.
        </p>
      </div>

      {/* ページリンク */}
      <div className="flex flex-row flex-wrap gap-6">
        {Links.map((link: PageLink) => (
          <LinkBlock key={link.href} pageLink={link} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;