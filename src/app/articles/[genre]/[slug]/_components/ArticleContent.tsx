'use client';

import Markdown, { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeTyplet from 'rehype-typlet';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'typlet/fonts/typlet.css';
import { Prose } from '@/src/components/ui/Prose';
import type { MathSyntax } from '@/src/lib/customParser';

// 将来のカスタムコンポーネント（シミュレーターなど）の差し込み口
// 例: { 'simulator-name': SimulatorComponent }
type CustomComponents = Record<string, React.ComponentType<{ node?: any; [key: string]: any }>>;

interface ArticleContentProps {
  content: string;
  // 数式の記法。tex は KaTeX、typst は Typlet で描画する。
  math?: MathSyntax;
  customComponents?: CustomComponents;
}

const defaultComponents: Components = {
  img: ({ node, ...props }) => (
    <span className="flex flex-col items-center my-4">
      <img
        {...props}
        className="max-w-full h-auto rounded-lg shadow-md"
        alt={props.alt || ''}
      />
      {props.alt && (
        <span className="text-sm text-muted mt-2 italic">{props.alt}</span>
      )}
    </span>
  ),
};

export default function ArticleContent({ content, math = 'tex', customComponents }: ArticleContentProps) {
  const components: Components = {
    ...defaultComponents,
    ...customComponents,
  };

  // 区切り記号（$...$ / $$...$$）はどちらの記法でも remark-math が解析する。
  // Typlet は描画できない数式を赤字の原文で表示し、ページ全体の描画は止めない。
  const mathPlugin = math === 'typst' ? rehypeTyplet : rehypeKatex;

  return (
    <Prose><Markdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[mathPlugin, rehypeHighlight]}
      components={components}
    >
      {content}
    </Markdown></Prose>
  );
}
