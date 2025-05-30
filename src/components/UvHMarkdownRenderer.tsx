// src/components/UvHMarkdownRenderer.tsx
// [ ]: インライン数式をTypstで表示できるようにする
// [ ]: 画像やグラフの挿入を可能にする
/**
 * fold -> 
*/

import MarkdownRenderer from "./MarkdownRenderer";
import { MathBlock } from "./MathRenderer";

// マークダウンを突っ込むコンポーネント
interface UvHMarkdownRendererProps {
  markdownContent: string;
  fileName: string;
}
const UvHMarkdownRenderer: React.FC<UvHMarkdownRendererProps> = ({ markdownContent, fileName }) => {
  // inputを$$でスプリット
  const renderContents = markdownContent.split(/\$\$/g);
  return (
    <>
      {renderContents.map((content, index) => {
        // インデックスの偶奇でレンダリングするコンポーネントを切り替え
        if (index % 2 === 0) {
          return <MarkdownRenderer markdownContent={content} key={index} />
        } else {
          return <MathBlock expression={content} fileName={`${fileName}-${index}`} key={index} />
        }
      })}
    </>
  )
}

export default UvHMarkdownRenderer;