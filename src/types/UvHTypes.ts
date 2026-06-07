// UvHTypes.ts
// 自分で作ったデータ型を置いておくファイル。

// アイコン付きのページリンク
export interface PageLink {
  href: string;
  label: string;
  sublinks: PageLink[];
  icon?: string;
  description?: string;
}