// Article.tsx
// Only Depth-1 Sections can be Article's children

import Header from "./Header";
import TocBlock from "./TocBlock";
import Section from "../Lv1/Section";
import ReferencesSection from "./ReferencesSection";

const Article: React.FC<{ content: any; children: any[] }> = ({ content, children }) => {
  return (
    <article>
      {/* ヘッダー */}
      <Header meta={content.meta} />


      {/* 目次 */}
      <TocBlock tocBlock={content.tocBlock} />


      {/* 子要素のレンダリング */}
      {children && children.map((child, idx) => <Section key={idx} content={child.content} depth={1} children={child.children} />)}


      {/* 参考文献 */}
      <ReferencesSection refBlock={content.refBlock} />
    </article>
  );
};

export default Article;