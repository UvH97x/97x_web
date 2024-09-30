// src/articles/Breadcrumbs.tsx
import Link from 'next/link';

import fileStructure from "@/src/data/fileStructure.json"

interface BreadcrumbItem {
  href: string;
}

export default function Breadcrumbs( param: BreadcrumbItem ) {

  const parsedPath = generateBreadcrumbs(param.href);

  return (
    <nav aria-label="breadcrumb">
      <div className="flex flex-row gap-2">
        {parsedPath.map((path, index) => (
          <span className="flex flex-row gap-2" key={path.href}>
            <Link href={path.href}>
              <span className="text-blue-600 hover:text-blue-800 underline">{path.text}</span>
            </Link>
            {/* 最後のアイテムでなければ > を表示 */}
            {index < parsedPath.length - 1 && (
              <span className="mx-2">&gt;</span> 
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}

// 階層ごとのリンクを作成するヘルパー関数
const generateBreadcrumbs = (asPath: string) => {
  // パスをスラッシュで分割し、最初の空白要素を除外
  const pathArray = asPath.split('/').filter((v) => v.length > 0);

  // 各部分パスに対してフルパスを生成
  const breadcrumbs = pathArray.map((subpath, index) => {
    const href = '/' + pathArray.slice(0, index + 1).join('/');
    const text = getTitleFromPath(href);
    return { href, text };
  });

  return breadcrumbs;
};

// パスからタイトルを取得するヘルパー関数
const getTitleFromPath = (path: string): string => {
  const match = fileStructure.find((item) => {
    // item.filePath の 'src/data/articles' と '.md' 部分を除いて一致を確認
    const adjustedFilePath = item.filePath.replace('src/data', '').replace('.md', '');
    return adjustedFilePath === path;
  });
  return match ? match.title : path.split('/').pop() || '';
};