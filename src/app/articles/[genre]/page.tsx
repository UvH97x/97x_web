import { PageHeader } from '@/src/components/ui/PageHeader';
// src/app/articles/[genre]/page.tsx

import Link from 'next/link';

import { fileStructure } from '@/src/data/fileStructure';

export function generateStaticParams() {
  return fileStructure
    .filter((file: any) => file.isDirectory && file.filePath.startsWith('src/data/articles/'))
    .map((dir: any) => ({ genre: dir.fileName }));
}

// メインファンクション
export default async function PageMain(props: { params: Promise<{ genre: string }> }) {
  const params = await props.params;
  // 該当ジャンルのディレクトリ情報を取得
  const dirInfo = fileStructure.find(file => file.fileName === params.genre);
  // 該当ジャンルの.mdファイルを取得
  const articleFiles = fileStructure.filter((file) => file.isDirectory === false && file.filePath.startsWith(`src/data/articles/${params.genre}`));

  // ジャンル説明を取得、存在しない場合はデフォルトの説明を使用
  const genreDescription = dirInfo?.description || 'Articles related to this genre.';

  return (
    <div>
      <div>
        {/* ジャンル名 */}
        <PageHeader description={genreDescription}>
          {dirInfo?.title}
        </PageHeader>

        {/* ジャンル説明 */}

        {/* 記事一覧 */}
        <div>
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
