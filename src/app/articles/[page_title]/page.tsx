/*
  * src/app/articles/[page.tsx]
  * 
 */

import fs from 'fs';
import path from 'path';
import { serializeMdx } from '@/src/lib/serializeMdx';
import { getParsedFile } from '@/src/lib/customParser';
import { ParsedFile } from '@/src/lib/customParser'; // 既存の型定義を利用
import MDXRemoteRenderer from '@/src/components/MDXRemoteRenderer'; // クライアントコンポーネントをインポート

export default async function Page({ params }: { params: { page_title: string } }) {
  const { page_title } = params;
  const articlePath = path.join(process.cwd(), 'src/data/articles', `${page_title}.mdx`);

  // メタデータを取得
  const articleData: ParsedFile = getParsedFile(articlePath);
  const mdxSource = await serializeMdx(articleData.content);

  return (
    <div className="prose">
      <h1>{articleData.title}</h1>
      <p><span>作成日: {articleData.createdAt}</span></p>
      <div>
        <h2>記事本編</h2>
        <MDXRemoteRenderer source={mdxSource} /> {/* クライアントサイドでMDXをレンダリング */}
      </div>
    </div>
  );
}
