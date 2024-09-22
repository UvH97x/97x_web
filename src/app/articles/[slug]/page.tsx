/*
  * src/app/articles/[page.tsx]/page.tsx
  TODO: 二回フェッチする問題は、メタデータをデータベースで扱うことにより解決すると思うため、一旦放置。
  TODO: og, twitter, canonical, robotsなどメタデータを増やしてもいい。
 */

import path from 'path';
import dynamic from 'next/dynamic';

import { ParsedFile, getParsedFile } from '@/src/lib/customParser';
import { getFilesWithExtensionSync } from '@/src/lib/getFiles';

// MarkdownRenderer コンポーネントをクライアントサイドでのみレンダリング
const MarkdownRenderer = dynamic(() => import('@/src/components/MarkdownRenderer'), {
  ssr: false,
});

// `generateStaticParams` で動的なパスを生成します
export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), "src", "data", "articles");
  const filenames = getFilesWithExtensionSync(articlesDir, ".md");

  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}

// メタデータの生成
interface Params {
  slug: string;  // 動的ルートパラメータ
}
export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = params;
  const articlePath = path.join(process.cwd(), 'src/data/articles', `${slug}.md`);
  const articleData = getParsedFile(articlePath);

  return {
    title: articleData.title,
    description: articleData.excerpt || articleData.content.slice(0, 150),
    keywords: articleData.tags.join(', '),
  };
}

// ページコンポーネントでデータをフェッチします
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const articlePath = path.join(process.cwd(), 'src/data/articles', `${slug}.md`);

  // メタデータと記事本文を取得
  const articleData: ParsedFile = getParsedFile(articlePath);

  // 確認用
  // console.log(articleData);

  return (
    <div className="prose max-w-none flex flex-col">
      <h1 className='text-center'>{articleData.title}</h1>
      <div className='px-4 flex justify-between'>
        <div className='flex flex-wrap gap-2 items-center'>
          {articleData.tags.map((tag, index) => (
            <span 
              key={index} 
              className='bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold'
            >
              {tag}
            </span>
          ))}
        </div>
        <div className='flex flex-col items-end'>
          <span>作成日: {articleData.createdAt}</span>
          {/* 更新日がある場合のみ表示 */}
          {articleData.updatedAt && <span>更新日: {articleData.updatedAt}</span>}
          <span>筆者: {articleData.author}</span>
        </div>
      </div>
      <MarkdownRenderer markdownContent={articleData.content} />
      <div className='flex flex-col'>
        {articleData.references.length > 0 && (
          <h2>参考</h2>
        )}
        <ul className='list-disc list-inside'>
          {articleData.references.map((reference, index) => {
            // "記事名, 記事リンク"の形式から分割
            const [name, url] = reference.split(', ');
            return (
              <li key={index}>
                <a href={url} className='text-blue-500 underline'>
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

// ISRの設定を追加(明らかに重くなってからでOK)
// 単位は秒
// export const revalidate = 60;