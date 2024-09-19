/*
  * src/lib/mdxToKatex.ts
*/

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface MdxToKatexResult {
  content: MDXRemoteSerializeResult;
}

export async function mdxToKatex(source: string): Promise<MdxToKatexResult> {
  const result = await serialize(source, {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    },
  });

  return { content: result };
}
