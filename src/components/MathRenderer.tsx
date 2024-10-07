// src/components/MathRenderer.tsx
// [ ]: SVGのXSS対策

"use client";

import React, { useState, useEffect, useRef } from "react";

interface MathRendererProps {
  expression: string;
  fileName: string;
  className?: string;
}

export function MathRenderer({ expression, fileName, className = "" }: MathRendererProps) {
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const svgContainerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/math-to-svg", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName, mathExpression: expression }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to convert math to SVG: ${response.status} - ${errorText}`);
        }

        const svgContent = await response.text();
        setSvg(svgContent);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching SVG:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (expression) {
      fetchSvg();
    }
  }, [expression]);

  return (
    <>
      {isLoading ? (
        <span className="animate-pulse bg-gray-200 h-8 w-full rounded" />
      ) : error ? (
        <span className="text-red-500">Error: {error}</span>
      ) : (
        <span
          ref={svgContainerRef}
          className={`${className}`}
          dangerouslySetInnerHTML={{__html: svg}}
        />
      )}
    </>
  );
}

// TODO: 以下二つのコンポーネントをしっかりスタイリング
// インライン数式(コピーの手段が判明するまであんま使わない)
export function InlineMath({ expression, fileName, className = "" }: MathRendererProps) {
  return (
    <MathRenderer expression={expression} fileName={fileName} className={`${className} px-1 rounded inline-block`} />
  );
}
// 数式ブロック(こっちメイン)
export function MathBlock({ expression, fileName, className = "" }: MathRendererProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <div className="rounded-md shadow flex flex-col py-2 gap-2 text-center">
      <div className="rounded-tl-md rounded-tr-md flex justify-end bg-gray-200">
        <button
          onClick={handleCopy}
          className="rounded-tl-md rounded-tr-md text-xs bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-black px-2 py-0.5 min-w-[110px]"
        >{copySuccess ? "Copied!" : "Copy Typst Code"}</button>
      </div>
      <div className="rounded-bl-md rounded-br-md text-center overflow-x-auto"> {/* この div を追加 */}
        <MathRenderer expression={expression} fileName={fileName} className={`${className} bg-white inline-block `} />
      </div>
    </div>
  );
}