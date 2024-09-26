// src/app/articles/page.tsx

import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Breadcrumbs from '@/src/components/Breadcrumbs';

interface FileData {
  fileName: string;
  filePath: string;
  isDirectory: boolean;
}

// JSONファイルからディレクトリ情報を取得
const getFileStructure = (): FileData[] => {
  // プロジェクトのルートディレクトリを基準にパスを解決
  const filePath = path.resolve('src', 'data', 'fileStructure.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

// サーバーコンポーネントとしてデータを直接取得
export default function ArticleHome() {
  const fileStructure = getFileStructure();

  // ディレクトリのみを抽出し、パスが 'src/data/articles' で始まるものだけを取得
  const genreDirs = fileStructure
    .filter(file => file.isDirectory && file.filePath.startsWith('src/data/articles')) // ディレクトリのみを抽出
    .map(dir => dir.fileName); // ディレクトリ名を取得

  console.log(genreDirs);

  return (
    <div className="w-full prose flex flex-col">
      {/* パンくずリスト */}
      <Breadcrumbs href="articles" title="記事ホーム" />
      <div className="flex flex-col items-center">
        {/* タイトル */}
        <h1 className="text^4xl font-bold mb-8 text-slate-900">
          Articles
        </h1>
        {/* 説明文 */}
        <p className="text-lg text-gray-700 mb-8">
          Explore a collection of in-depth articles on various topics in physics
        </p>
        
        {/* ジャンル一覧 */}
        <div className="w-full max-w-4xl">
          <ul className="space-y-4">
            {genreDirs.map((genre, index) => (
              <li key={index}>
                <Link href={`/articles/${genre}`}>
                  <span className="text-2xl text-blue-600 hover:text-blue-800 underline transition duration-300 cursor-pointer">
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
