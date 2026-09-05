'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Renders a static KaTeX source string. The markup is generated locally, never from user input. */
export function Tex({ children, display = false }: { children: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: display, throwOnError: false, output: 'html' }),
    [children, display],
  );
  return (
    <span
      className={display ? 'block overflow-x-auto overflow-y-hidden py-1' : 'inline-block'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
