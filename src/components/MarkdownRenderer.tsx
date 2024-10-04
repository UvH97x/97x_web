// /src/components/MarkdownRenderer.tsx

'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'; // 数式のサポート
import rehypeKatex from 'rehype-katex'; // KaTeXのサポート
import 'katex/dist/katex.min.css'; // KaTeXのCSSをインポート

interface MarkdownRendererProps {
  markdownContent: string; // markdownファイルの内容を文字列として受け取る
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  // Prism.jsのハイライトを適用
  useEffect(() => {
    Prism.highlightAllUnder(document);
  }, []);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]} // remark-mathで数式を解析
      rehypePlugins={[rehypeKatex]} // rehype-katexで数式をKaTeXでレンダリング
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
