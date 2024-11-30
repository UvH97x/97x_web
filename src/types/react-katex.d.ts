// KaTeXの型定義


declare module "react-katex" {
  import { ReactNode } from "react";

  export interface KatexProps {
    children: ReactNode; // 数式の文字列を子要素として受け取る
    math?: string; // 数式の文字列
    errorColor?: string; // エラー時の文字色
    renderError?: (error: Error) => ReactNode; // エラー時のレンダリング
  }

  export const InlineMath: React.FC<KatexProps>;
  export const BlockMath: React.FC<KatexProps>;
}
