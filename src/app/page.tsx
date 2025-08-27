// src/app/page.tsx

import React from 'react';

import type { Metadata } from 'next'

import { PageLink } from '@/src/types/UvHTypes';
import LinkBlock from './_components/LinkBlock';
import { Prose } from '@/src/components/ui/Prose';
import { Container } from '../components/ui/Container';

export default function PageMain() {
  // コンテンツ
  const title: string = "97x";
  const description: string = "This website was created for the purpose of storing my notes on matters I struggled with in my studies, simulators I created, etc. Also, I am still in the process of learning and have never created a website before, so please forgive me for any mistakes I may have made.";

  // リンク
  const Links: PageLink[] = [
    { href: "/articles", label: "記事", sublinks: [], icon: "/articles.svg", },
    { href: "/simulators", label: "シミュレーター", sublinks: [], icon: "/simulators.svg", },
    { href: "/applications", label: "アプリ", sublinks: [ { href: "/applications/todo", label: "Todo", sublinks: [] } ], icon: "/apps.svg", },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* タイトル */}
      <h1 className="text-4xl font-bold font-sans my-4 text-slate-900">
        { title }
      </h1>
  
      {/* 説明文 */}
      <div className="my-8">
        <Container>
          <Prose>{ description }</Prose>
        </Container>
      </div>

      {/* ページリンク */}
      <div className="flex flex-row justify-around flex-wrap gap-6">
        {Links.map((link: PageLink) => (
          <LinkBlock key={link.href} pageLink={link} />
        ))}
      </div>
    </div>
  );
}

// メタデータの生成
export const metadata: Metadata = {
    description: "97x Top Page",
};