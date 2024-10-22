// src/components/MathRenderer.tsx
// [ ]: SVGのXSS対策

"use client";

import React, { useState, useEffect, useRef } from "react";

interface MathRendererProps {
  expression: string;
  fileName: string;
  className?: string;
}

export default function MathRenderer({ expression, fileName, className = "" }: MathRendererProps) {
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
        <span className="animate-pulse text-gray-600 h-8 w-full rounded">Fetching Math...</span>
      ) : error ? (
        <span className="text-red-500">Error: {error}</span>
      ) : (
        <span
          ref={svgContainerRef}
          className={`${className} inline-block`}
          style={{ verticalAlign: "middle" }}
          dangerouslySetInnerHTML={{__html: svg}}
        />
      )}
    </>
  );
}