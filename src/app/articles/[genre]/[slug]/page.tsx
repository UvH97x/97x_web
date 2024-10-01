/*
  * src/app/articles/[page.tsx]/page.tsx
  TODO: 二回フェッチする問題は、メタデータをデータベースで扱うことにより解決すると思うため、一旦放置。
  TODO: og, twitter, canonical, robotsなどメタデータを増やしてもいい。
 */

  import path from 'path';
  import dynamic from 'next/dynamic';
  import { ParsedFile, getParsedFile } from '@/src/lib/customParser';
  import { fileStructure } from '@/src/data/fileStructure';
  
  // MarkdownRenderer コンポーネントをクライアントサイドでのみレンダリング
  const MarkdownRenderer = dynamic(() => import('@/src/components/MarkdownRenderer'), {
    ssr: false,
  });
  
  // 記事データを取得する関数
  const getArticleFilesByGenre = (genre: string): any[] => {
    return fileStructure.filter((file: any) =>
      file.filePath.startsWith(`src/data/articles/${genre}`) && file.filePath.endsWith('.md')
    );
  };
  
  // `generateStaticParams` で動的なパスを生成します
  export async function generateStaticParams({ params }: { params: { genre: string } }) {
    const articleFiles = getArticleFilesByGenre(params.genre);
  
    return articleFiles.map((file) => ({
      slug: file.fileName.replace(/\.md$/, ''),
    }));
  }
  
  // メタデータの生成
  export async function generateMetadata({ params }: { params: { genre: string, slug: string } }) {
    const { genre, slug } = params;
    const articlePath = path.join(process.cwd(), 'src/data/articles', genre, `${slug}.md`);
    const articleData = getParsedFile(articlePath);
  
    return {
      title: articleData.title,
      description: articleData.excerpt || articleData.content.slice(0, 150),
      keywords: articleData.tags.join(', '),
    };
  }
  
  // ページコンポーネントでデータをフェッチします
  export default async function Page({ params }: { params: { genre: string, slug: string } }) {
    const { genre, slug } = params;
    const articlePath = path.join(process.cwd(), 'src/data/articles', genre, `${slug}.md`);
  
    // メタデータと記事本文を取得
    const articleData: ParsedFile = getParsedFile(articlePath);
  
    return (
      <div className="prose max-w-none flex flex-col">
        <h1 className="text-center">{articleData.title}</h1>
        <div className="px-4 flex justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {articleData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-end">
            <span>作成日: {articleData.createdAt}</span>
            {articleData.updatedAt && <span>更新日: {articleData.updatedAt}</span>}
            <span>筆者: {articleData.author}</span>
          </div>
        </div>
        <MarkdownRenderer markdownContent={articleData.content} />
        <div className="flex flex-col">
          {articleData.references.length > 0 && (
            <h2>参考</h2>
          )}
          <ul className="list-disc list-inside">
            {articleData.references.map((reference, index) => {
              const [name, url] = reference.split(', ');
              return (
                <li key={index}>
                  <a href={url} className="text-blue-500 underline">
                    {name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  
  // ISRの設定を追加
  // export const revalidate = 60;
  