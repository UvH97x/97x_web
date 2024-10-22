/**
 * UvHArticleRenderer.tsx
 * 
 * このコンポーネントは、与えられた記事コンテンツを "normal" か "fold"（折り畳み）として分離し、それぞれ適切な方法でレンダリングします。
 * 折り畳みコンテンツは "UvHFoldedContentRenderer"、通常コンテンツは "UvHContentRenderer" によってレンダリングされます。
 * コンテンツの区別は `<<<` で始まり `>>>` で終わるブロックが "fold" として扱われます。
 * 
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.articleContent - レンダリングする記事コンテンツ
 * @param {string} props.fileName - 各ブロックに一意のキーを与えるためのファイル名
 * 
 * @example
 * const content = `
 * <<< Fold Title
 * This is foldable content. >>>
 * This is regular content.
 * `;
 * 
 * <UvHArticleRenderer articleContent={content} fileName="example" />
 * 
 * @interface BlockSegment
 * 各コンテンツブロックを識別するデータ構造
 * @property {string} normalOrFold - コンテンツが "normal" か "fold" かを表す
 * @property {string} content - コンテンツ本体
 * @property {string} [alt] - 折り畳み部分のタイトル（foldのときのみ）
 * 
 * @function separateNormalOrFold
 * 与えられた文字列を "normal" と "fold" のブロックに分割します。
 * 折り畳み部分は `<<<` から `>>>` までを一つのブロックとして扱います。
 * @param {string} article - 分割する記事コンテンツ
 * @returns {BlockSegment[]} - 分割されたコンテンツブロックの配列
 * 
 * @example
 * const segments = separateNormalOrFold("<<< Title\nFolded Content >>> Regular Content");
 * // [
 * //   { normalOrFold: "fold", alt: "Title", content: "Folded Content" },
 * //   { normalOrFold: "normal", content: "Regular Content" }
 * // ]
 */

import UvHContentRenderer from "./UvHContentRenderer";
import UvHFoldedContentRenderer from "./UvHFoldedContentRenderer";

// マークダウンを突っ込むコンポーネント
interface UvHArticleRendererProps {
  articleContent: string;
  fileName: string;
}
const UvHArticleRenderer: React.FC<UvHArticleRendererProps> = ({ articleContent, fileName }) => {
  // 折り畳みとそうでないものを分離
  const normalOrFold = separateNormalOrFold(articleContent);
  return (
    <div>
    {normalOrFold.map((item, index) => (
      item.normalOrFold === "fold" 
      ? (
        <div key={index}>
          <UvHFoldedContentRenderer alt={item.alt} content={item.content} fileName={`${fileName}-${index}`}/>
        </div>
      ) : item.normalOrFold === "normal" ? (
        <div key={index}>
          <UvHContentRenderer content={item.content} fileName={`${fileName}-${index}`}/>
        </div>
      ) : (
        <div key={index}>The structure of the content is wrong.</div>
      )
    ))}
    </div>
  );
};
export default UvHArticleRenderer;
// 折り畳みコンテンツとそうでないものの分離
interface BlockSegment {
  normalOrFold: "normal" | "fold";
  alt?: string;
  content: string;
}
export function separateNormalOrFold(article: string): BlockSegment[] {
  // 結果となる配列
  const result: BlockSegment[] = [];
  
  // 入力された文字列をスプリット
  const splitedArticle = article.match(/<<<.*?>>>|[^]+?(?=<<<|$)/gs);

  // スプリットされた文字列に対し、ヘッダーを付けたり不要部分を取り除いたりする
  splitedArticle?.forEach((part) => {
    if (part.startsWith("<<<") && part.endsWith(">>>")) {
      // 不要な記号を取り除き、foldヘッダーを設定
      const idRemoved = part.slice(3, -3);
      // 一行目を取得
      const newlineIndex = idRemoved.indexOf("\n");
      const [alt, content] = [idRemoved.slice(0, newlineIndex), idRemoved.slice(newlineIndex + 1)];
      result.push({
        normalOrFold: "fold",
        alt: alt,
        content: content
      });
    } else if (part.trim()) {
      // 折りたたまれていない部分はnormalヘッダーを設定
      result.push({
        normalOrFold: "normal",
        content: part
      });
    }
  })

  // altがundefindかどうかでnormalとfoldを識別できるかも？分かりにくいと思うので今はやめておくけど。
  return result;
}
