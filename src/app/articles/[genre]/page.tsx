// src/app/articles/[genre]/page.tsx

import Link from 'next/link';

import { fileStructure } from '@/src/data/fileStructure';

// メインファンクション
export default function GenrePage({ params }: { params: { genre: string } }) {
  // 該当ジャンルのディレクトリ情報を取得
  const dirInfo = fileStructure.find(file => file.fileName === params.genre);
  // 該当ジャンルの.mdファイルを取得
  const articleFiles = fileStructure.filter((file) => file.isDirectory === false && file.filePath.startsWith(`src/data/articles/${params.genre}`));

  // ジャンル説明を取得、存在しない場合はデフォルトの説明を使用
  const genreDescription = dirInfo?.description || 'Articles related to this genre.';

  return (
    <div className="w-full flex flex-col p-0">
      <div className="flex flex-col items-center">
        {/* ジャンル名 */}
        <h1 className="text-4xl font-bold mb-8 text-slate-900 capitalize">
          {dirInfo?.title}
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
                <li key={index} className='prose'>
                  <Link href={`/articles/${params.genre}/${article.fileName.replace(".md", "")}`}>
                    {article.title} {/* ファイル名を整形して表示 */}
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
