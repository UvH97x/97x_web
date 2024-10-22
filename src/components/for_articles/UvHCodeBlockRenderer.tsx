"use client";

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current); // Prism.jsでハイライトを適用
    }
  }, [code, lang]); // codeとlangが変わったときに再度ハイライトを適用

  return (
    <pre>
      <code ref={codeRef} className={`lang-${lang}`}>
        {code}
      </code>
    </pre>
  );
};

export default UvHCodeBlockRenderer;