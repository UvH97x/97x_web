// src/lib/serializeMdx.ts
// MDXをKatexに突っ込むのに必要
// src/app/articles/[page_title]/page.tsxで使用中


import { serialize } from 'next-mdx-remote/serialize';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export async function serializeMdx(content: string) {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkMath], // 数式のサポート
      rehypePlugins: [rehypeKatex], // KaTeXのサポート
    },
  });
}