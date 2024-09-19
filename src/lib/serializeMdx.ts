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