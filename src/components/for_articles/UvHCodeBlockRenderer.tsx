"use client";

import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';

interface UvHCodeBlockRendererProps {
  code: string;
  lang?: string;
}

const UvHCodeBlockRenderer: React.FC<UvHCodeBlockRendererProps> = ({ code, lang }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current); // Prism.jsでハイライトを適用
    }
  }, [code, lang]); // codeとlangが変わったときに再度ハイライトを適用

  // コードをクリップボードにコピーする関数
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2秒後に「コピー済み」をリセット
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="flex-col gap-0 bg-[#2d2d2d] rounded-md">
      <div className="rounded-tl-md rounded-tr-md bg-gray-200 relative flex justify-end">
        {/* lang表示エリア */}
        {lang && (
          <span className="text-xs absolute top-0.5 left-3">
            {lang}
          </span>
        )}
        {/* コピーボタン */}
        <button
          onClick={handleCopy}
          className="rounded-tl-md rounded-tr-md text-xs bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black px-2 py-0.5 min-w-[110px]"
        >
          {isCopied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <pre className="overflow-x-auto flex shadow-none py-2">
        <code ref={codeRef} className={`lang-${lang}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default UvHCodeBlockRenderer;