/*
  * src/typings/react-katex.d.ts
  * 今のが成功したらいらない。
*/

declare module 'react-katex' {
  import { ComponentType } from 'react';

  export const InlineMath: ComponentType<{ math: string }>;
  export const BlockMath: ComponentType<{ math: string }>;
}