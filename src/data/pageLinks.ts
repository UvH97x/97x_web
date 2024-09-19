/*
  * /src/data/pageLinks.ts
*/

import { ComponentType } from "react";

export interface PageLink {
  href: string;
  label: string;
  sublinks: PageLink[]; // サブリンクもPageLink型にする
  icon?: string; // オプションでアイコンを追加
  isActive?: boolean; // オプションで現在のページをアクティブ表示するフラグ
}

export const PageLinks: PageLink[] = [
  {
    href: "/",
    label: "Home",
    sublinks: [
      { href: "/articles", label: "Articles", sublinks: [] },
      { href: "/applications", label: "Apps", sublinks: [] }
    ],
    icon: "/home.svg",
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
    href: "/articles",
    label: "Articles",
    sublinks: [],
    icon: "/articles.svg",
  },
  {
    href: "/simulators",
    label: "Simulators",
    sublinks: [],
    icon: "/simulators.svg",
  },
];