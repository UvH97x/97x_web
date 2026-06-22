'use client';

import Markdown, { Components } from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/tokyo-night-dark.css';

// 将来のカスタムコンポーネント（シミュレーターなど）の差し込み口
// 例: { 'simulator-name': SimulatorComponent }
type CustomComponents = Record<string, React.ComponentType<{ node?: any; [key: string]: any }>>;

interface ArticleContentProps {
  content: string;
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
        <span className="text-sm text-gray-500 mt-2 italic">{props.alt}</span>
      )}
    </span>
  ),
};

export default function ArticleContent({ content, customComponents }: ArticleContentProps) {
  const components: Components = {
    ...defaultComponents,
    ...customComponents,
  };

  return (
    <Markdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={components}
    >
      {content}
    </Markdown>
  );
}
