import { PageHeader } from '@/src/components/ui/PageHeader';
// src/app/articles/page.tsx

import Link from 'next/link';
import { fileStructure } from '@/src/data/fileStructure';

// サーバーコンポーネントとしてデータを直接取得
export default function PageMain() {
  // ディレクトリのみを抽出し、パスが 'src/data/articles' で始まるものだけを取得
  const genreDirs = fileStructure
    .filter(file => file.isDirectory && file.filePath.startsWith('src/data/articles')); // ディレクトリのみを抽出

  return (
    <div>
      <div>
        {/* タイトル */}
        <PageHeader description={genreDirs[0]?.description || "No description available"}>
          記事トップ
        </PageHeader>
        {/* 説明文 */}

        {/* ジャンル一覧 */}
        <div className="w-full">
          <ul className="space-y-4">
            {genreDirs.map((genre, index) => {
              const slugs = fileStructure.filter(file => !file.isDirectory && file.filePath.startsWith(`${genre.filePath}`));
              if (index !== 0) {
                return (
                  <li key={index}>
                    <Link href={`/articles/${genre.fileName}`}>
                      <span className="text-accent underline underline-offset-4">
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
