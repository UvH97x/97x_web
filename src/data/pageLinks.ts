/*
  * /src/data/pageLinks.ts
*/

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
  },
  {
    href: "/applications",
    label: "Apps",
    sublinks: [
      { href: "/applications/todo", label: "Todo", sublinks: [] }
    ],
  },
  {
    href: "/articles",
    label: "Articles",
    sublinks: [],
  },
  {
    href: "/simulators",
    label: "Simulators",
    sublinks: [],
  },
];