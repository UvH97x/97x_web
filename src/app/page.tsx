import { PageHeader } from '@/src/components/ui/PageHeader';
import React from 'react';
import type { Metadata } from 'next';

import { PageLink } from '@/src/types/UvHTypes';
import LinkBlock from '@/src/app/_components/LinkBlock';

export const metadata: Metadata = {
  description: '数学・物理・機械学習の学習メモとシミュレーターを公開しているサイトです。',
};

const links: PageLink[] = [
  {
    href: '/articles',
    label: 'Articles',
    sublinks: [],
    icon: '/article_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg',
    description: '学習中につまずいた内容をまとめたメモ記事です。',
  },
  {
    href: '/simulators',
    label: 'Simulators',
    sublinks: [],
    icon: '/simulation_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg',
    description: '数学・物理・ML の概念をインタラクティブに体験できます。',
  },
  {
    href: '/applications',
    label: 'Applications',
    sublinks: [],
    icon: '/apps_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg',
    description: '実用的な小規模 Web アプリを公開しています。',
  },
  {
    href: '/about',
    label: 'About',
    sublinks: [],
    icon: '/contact_support_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg',
    description: 'このサイトについて。'
  },
  {
    href: '/data',
    label: 'Data',
    sublinks: [],
    icon: '/database_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg',
    description: '公開データ'
  }
];

export default function PageMain() {
  return (
    <div>

      {/* ヒーロー */}
      <section>
        <PageHeader description="数学・物理・機械学習の学習メモとシミュレーターを公開しています。">
          97x
        </PageHeader>
      </section>

      {/* 主要カードグリッド */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <LinkBlock key={link.href} pageLink={link} />
          ))}
        </div>
      </section>

    </div>
  );
}
