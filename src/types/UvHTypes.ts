// UvHTypes.ts
// 自分で作ったデータ型を置いておくファイル。

// アイコン付きのページリンク
export interface PageLink {
  href: string;
  label: string;
  sublinks: PageLink[]; // サブリンクもPageLink型にする
  icon?: string; // オプションでアイコンを追加
}