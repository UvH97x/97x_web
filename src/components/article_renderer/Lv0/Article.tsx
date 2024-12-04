// Article.tsx
// Only Depth-1 Sections can be Article's children

import Header from "./Header";
import TocBlock from "./TocBlock";
import Renderer from "../Renderer";
import ReferencesSection from "./ReferencesSection";

const Article: React.FC<{ content: any; children: any[] }> = ({ content, children }) => {
  return (
    <article className="custom-font">
      {/* ヘッダー */}
      <Header meta={content.meta} />


      {/* 目次 */}
      <div className="md:grid md:grid-cols-2">
        <span className="md:col-span-1">
          <TocBlock tocBlock={content.tocBlock} />
        </span>
      </div>
      

      {/* 子要素のレンダリング */}
      {children && children.map((child, idx) => 
        <Renderer key={idx} data={child} />
      )}


      {/* 参考文献 */}
      <ReferencesSection refBlock={content.refBlock} />
    </article>
  );
};

export default Article;