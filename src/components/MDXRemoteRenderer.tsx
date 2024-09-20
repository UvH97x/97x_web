/*
  * /src/components/MDXRemoteRenderer.tsx
*/

'use client';

import { useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';

interface MDXRemoteRendererProps {
  source: MDXRemoteSerializeResult; // 型をanyからMDXRemoteSerializeResultに変更
}

const MDXRemoteRenderer: React.FC<MDXRemoteRendererProps> = ({ source }) => {
  // Prism.jsのハイライトを適用
  useEffect(() => {
    Prism.highlightAllUnder(document);
  }, []);

  return <MDXRemote {...source} />;
};

export default MDXRemoteRenderer;
