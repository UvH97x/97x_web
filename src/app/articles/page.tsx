/*
  * /src/app/articles/page.tsx
*/

import React from 'react';
import Link from 'next/link';

export default function ArticleHome() {
  const articles = [
    { title: 'Quantum Mechanics Basics', href: '/articles/quantum-mechanics' },
    { title: 'General Relativity Overview', href: '/articles/general-relativity' },
    { title: 'Statistical Physics Introduction', href: '/articles/statistical-physics' },
    // さらに記事を追加可能
  ];

  return (
    <div className="flex flex-col items-center p-0">
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
                  {article.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
