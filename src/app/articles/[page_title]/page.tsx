/*
  * src/app/articles/[page.tsx]/page.tsx
  * 
 */

import path from 'path';
import { ParsedFile, getParsedFile } from '@/src/lib/customParser';
import { serializeMdx } from '@/src/lib/serializeMdx';
import dynamic from 'next/dynamic';
import fs from 'fs';

import { getFilesWithExtensionSync } from '@/src/lib/getFiles';

// MDXRemoteRenderer コンポーネントをクライアントサイドでのみレンダリング
const MDXRemoteRenderer = dynamic(() => import('@/src/components/MDXRemoteRenderer'), {
  ssr: false, // サーバーサイドレンダリング（SSR）を無効にする
});

// `generateStaticParams` で動的なパスを生成します
export async function generateStaticParams() {
  const articlesDir = path.join(process.cwd(), 'src/data/articles');
  const filenames = getFilesWithExtensionSync(articlesDir, ".mdx");;

  return filenames.map((filename) => ({
    page_title: filename.replace(/\.mdx$/, ''),
  }));
}


// ページコンポーネントでデータをフェッチします
export default async function Page({ params }: { params: { page_title: string } }) {
  const { page_title } = params;
  const articlePath = path.join(process.cwd(), 'src/data/articles', `${page_title}.mdx`);

  // メタデータと記事本文を取得
  const articleData: ParsedFile = getParsedFile(articlePath);

  // 本文をMDXとしてシリアライズ
  const mdxSource = await serializeMdx(articleData.content);

  return (
    <div className="prose max-w-none">
      <h1>{articleData.title}</h1>
      <span>作成日: {articleData.createdAt}</span>
      <span>更新日: {articleData.updatedAt}</span>
      <div>
        <h2>記事本編</h2>
        <MDXRemoteRenderer source={mdxSource} />
      </div>
    </div>
  );
}

// ISRの設定を追加
export const revalidate = 60; // 60秒ごとに再生成
