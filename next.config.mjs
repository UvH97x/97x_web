/*
  * next.config.mjs
*/

import withMDX from '@next/mdx';

const nextConfig = withMDX({
  extension: /\.mdx?$/, // .mdx または .md ファイルを処理
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})({
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'], // .mdx ファイルをページとして認識
});

export default nextConfig;
