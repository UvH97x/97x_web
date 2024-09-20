/*
  * /src/app/articles/page.tsx
  [ ]: メタデータをVercel Postgreに保存して、トップに表示する記事リンクの最適化や検索機能の実装を行いたい。
*/
import path from "path";

import React from 'react';
import Link from 'next/link';

import { getFilesWithExtensionSync } from '@/src/lib/getFiles';
import { metaData, getMetaData } from "@/src/lib/customParser";

export default function ArticleHome() {
  const articlePaths: string[] = getFilesWithExtensionSync("src/data/articles/",".mdx");
  // console.log(articlePaths);
  const articles: {metaData: metaData, href: string}[] = articlePaths.map((filePath) => {
    const fullPath = path.join('src/data/articles', filePath);  // フルパスを作成
    const metaData = getMetaData(fullPath);  // メタデータを取得

    // ファイル名からリンクを生成 (例えば、"/articles/sample" のようにする)
    const href = `/articles/${filePath.replace(/\.mdx$/, '')}`;
    return {
      metaData,
      href,
    };
  });

  const code = `#include <iostream>
int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`;

  const equation = `\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}`;

  return (
    <div className="w-full flex flex-col items-center p-0">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-8 text-slate-900">
        Articles on Mathematics and Physics
      </h1>

      {/* 説明文 */}
      <p className="text-lg text-gray-700 mb-8">
        Explore a collection of in-depth articles on various topics in mathematics and physics.
      </p>

      {/* 記事一覧 */}
      <div className="w-full max-w-4xl">
        <ul className="space-y-4">
          {articles.map((article, index) => (
            <li key={index}>
              <Link href={article.href}>
                <span className="text-2xl text-blue-600 hover:text-blue-800 underline transition duration-300 cursor-pointer">
                  {article.metaData.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
