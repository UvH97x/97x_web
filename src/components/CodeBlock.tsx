/*
  * src/components/CodeBlock.tsx
  * 一行が長いときに、自動的に折り返せるようにしたい。
*/

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as style } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
  width?: string; // 任意で幅を指定可能
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, width = '100%' }) => {
  return (
    <div style={
      {
        width: width,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word'
      }
    }>
      <SyntaxHighlighter language={language} style={style} showLineNumbers>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;