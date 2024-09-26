// src/app/articles/[genre]/page.tsx

import path from 'path';
import fs from 'fs';
import Link from 'next/link';

// JSONファイルから記事データを取得する関数
const getArticleFilesByGenre = (genre: string): string[] => {
  const filePath = path.resolve('src', 'data', 'fileStructure.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fileStructure = JSON.parse(fileContent);

  // 該当ジャンルに含まれる.mdファイルを抽出
  return fileStructure
    .filter((file: any) => file.isDirectory === false && file.filePath.startsWith(`src/data/articles/${genre}`) && file.filePath.endsWith('.md'))
    .map((file: any) => file.fileName.replace('.md', '')); // 拡張子を削除
};

// ジャンルごとの説明文を保持するオブジェクト
const genreDescriptions: { [key: string]: string } = {
  tech: 'Tech related articles covering programming, development, and technology trends.',
  life: 'Life-related articles focusing on lifestyle, productivity, and well-being.',
  // 他のジャンルに関する説明を追加
};

// メインファンクション
export default function GenrePage({ params }: { params: { genre: string } }) {
  // 該当ジャンルの.mdファイルを取得
  const articleFiles = getArticleFilesByGenre(params.genre);

  // ジャンル説明を取得、存在しない場合はデフォルトの説明を使用
  const genreDescription = genreDescriptions[params.genre] || 'Articles related to this genre.';

  return (
    <div className="prose w-full flex flex-col p-0">
      <div className="flex flex-col items-center">
        {/* ジャンル名 */}
        <h1 className="text-4xl font-bold mb-8 text-slate-900 capitalize">
          {params.genre}
        </h1>

        {/* ジャンル説明 */}
        <p className="text-lg text-gray-700 mb-8">
          {genreDescription}
        </p>

        {/* 記事一覧 */}
        <div className="w-full max-w-4xl">
          {articleFiles.length > 0 ? (
            <ul className="space-y-4">
              {articleFiles.map((article, index) => (
                <li key={index}>
                  <Link href={`/articles/${params.genre}/${article}`}>
                    {article.replace(/-/g, ' ')} {/* ファイル名を整形して表示 */}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No articles found in this genre.</p>
          )}
        </div>
      </div>
    </div>
  );
}
