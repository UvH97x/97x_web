// /src/components/MarkdownRenderer.tsx

'use client';

import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';
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
      components={{
        img: ({ node, ...props }) => (
          <div className="flex flex-col items-center my-4">
            <img
              {...props}
              className="max-w-full h-auto rounded-lg shadow-md" // 画像のスタイリングにTailwind CSSを使用
              alt={props.alt || ''}
            />
            {props.alt && (
              <p className="text-sm text-gray-500 mt-2 italic">{props.alt}</p> // altテキストを画像の下に表示
            )}
          </div>
        )
      }}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
