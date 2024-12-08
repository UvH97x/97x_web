// Article.tsx
// Only Depth-1 Sections can be Article's children

import Header from "./Header";
import TocBlock from "./TocBlock";
import Renderer from "../Renderer";
import ReferencesSection from "./ReferencesSection";
import { ArticleContent } from "@/src/app/applications/article-editform-test/article-edit-type";

interface ArticleProps {
  article: ArticleContent;
}

const Article: React.FC<ArticleProps> = ({ article }) => {
  const { content, children } = article;
  const { meta, toc, ref} = content;
  return (
    <article className="custom-font">
      {/* ヘッダー */}
      <Header meta={meta} />


      {/* 目次 */}
      <div className="md:grid md:grid-cols-2">
        <span className="md:col-span-1">
          <TocBlock tocBlock={toc} />
        </span>
      </div>
      

      {/* 子要素のレンダリング */}
      {children && children.map((child, idx) => 
        <Renderer key={idx} data={child} />
      )}


      {/* 参考文献 */}
      <ReferencesSection refBlock={ref} />
    </article>
  );
};

export default Article;