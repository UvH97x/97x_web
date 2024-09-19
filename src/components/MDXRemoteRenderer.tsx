'use client';  // クライアントサイドで動作させる

import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

interface MDXRemoteRendererProps {
  source: MDXRemoteSerializeResult;
}

const MDXRemoteRenderer: React.FC<MDXRemoteRendererProps> = ({ source }) => {
  return <MDXRemote {...source} />;
};

export default MDXRemoteRenderer;