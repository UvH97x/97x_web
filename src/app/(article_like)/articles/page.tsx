// src/app/articles/page.tsx

import Link from 'next/link';
import { fileStructure } from '@/src/data/fileStructure';

// サーバーコンポーネントとしてデータを直接取得
export default function PageMain() {
  // ディレクトリのみを抽出し、パスが 'src/data/articles' で始まるものだけを取得
  const genreDirs = fileStructure
    .filter(file => file.isDirectory && file.filePath.startsWith('src/data/articles')); // ディレクトリのみを抽出

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl prose">
        {/* タイトル */}
        <h1 className="text-4xl font-bold mb-8 text-slate-900 text-center">
          記事トップ
        </h1>
        {/* 説明文 */}
        <p className="text-lg text-gray-700 mb-8 text-center">
          {genreDirs[0]?.description || "No description available"}
        </p>

        {/* ジャンル一覧 */}
        <div className="w-full">
          <ul className="space-y-4">
            {genreDirs.map((genre, index) => {
              const slugs = fileStructure.filter(file => !file.isDirectory && file.filePath.startsWith(`${genre.filePath}`));
              if (index !== 0) {
                return (
                  <li key={index}>
                    <Link href={`/articles/${genre.fileName}`}>
                      <span className="underline transition duration-300 cursor-pointer">
                        {genre.title}
                      </span>
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
