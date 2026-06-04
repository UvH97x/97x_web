// /src/components/MarkdownRenderer.tsx

'use client';

import Markdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/tokyo-night-dark.css';

interface MarkdownRendererProps {
  markdownContent: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  return (
    <Markdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
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
        )
      }}
    >
      {markdownContent}
    </Markdown>
  );
};

export default MarkdownRenderer;