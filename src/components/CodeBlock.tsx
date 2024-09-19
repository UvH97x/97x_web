/*
  * src/components/CodeBlock.tsx
  * 幅を固定できるとなお見栄えが良い。
*/

"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as style } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2秒後にメッセージを消す
    });
  };

  return (
    <div className={`relative overflow-auto`}>
      <div className='absolute top-2 right-0 text-xs flex flex-row'>
        {/* 言語表示（左上） */}
        <div className="bg-gray-300 rounded px-1 py-0.5">
          {language}
        </div>
        {/* コピー ボタン（右上） */}
        <button 
          onClick={handleCopy} 
          className="bg-gray-800 text-white rounded hover:bg-gray-600 w-12"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* コード表示 */}
      <SyntaxHighlighter 
        language={language} 
        style={style} 
        showLineNumbers
        wrapLongLines={true}
        customStyle={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowWrap: 'break-word' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
