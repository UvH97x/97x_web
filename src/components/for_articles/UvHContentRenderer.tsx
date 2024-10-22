/**
 * UvHContentRenderer.tsx
 * 
 * このコンポーネントは、与えられたコンテンツを様々なブロック（数式、コード、表、テキスト）に分割し、それぞれ適切な方法でレンダリングします。
 * コンテンツは `parseContentBlocks` 関数を使って解析され、ブロックごとに異なるコンポーネントで表示されます。
 * 
 * MathBlock, UvHTableRenderer など、他のコンポーネントを使用して、対応する形式でレンダリングを行います。
 * 未知のブロック形式が与えられた場合には "Unknown content type" として処理されます。
 * 
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.content - レンダリングするコンテンツ文字列
 * @param {string} props.fileName - 各ブロックに一意のキーを与えるためのファイル名
 * 
 * @example
 * const content = `
 * $$ math block content $$
 * [[[ Table Content ]]]
 * Regular text content.
 * `;
 * 
 * <UvHContentRenderer content={content} fileName="example" />
 * 
 * @interface ContentBlock
 * ブロックごとのデータを表すインターフェース
 * @property {string} header - ブロックの種類を指定（math, code, table, text）
 * @property {string} content - ブロック内のコンテンツ
 * @property {string} [alt] - 数式やコードブロックのヘッダー部分に表示されるオプションの説明テキスト
 * 
 * @function parseContentBlocks
 * 文字列を `ContentBlock[]` としてパースし、それぞれのブロックを認識します。
 * ブロックには数式（$$～$$）、コード（```～```）、表（[[[～]]]）、および通常のテキストがあります。
 * @param {string} article - パースする記事コンテンツ
 * @returns {ContentBlock[]} - 解析されたコンテンツブロックの配列
 * 
 * @example
 * const blocks = parseContentBlocks("$$ math $$ Some text");
 * // [
 * //   { header: "math", content: "math" },
 * //   { header: "text", content: "Some text" }
 * // ]
 */

import UvHMathBlockRenderer from "./UvHMathBlockRenderer";
import UvHTableRenderer from "./UvHTableRenderer";
import UvHCodeBlockRenderer from "./UvHCodeBlockRenderer";

// 各コンテンツをレンダリングするコンポーネント
interface UvHContentRendererProps {
  content: string;
  fileName: string;
}
const UvHContentRenderer: React.FC<UvHContentRendererProps> = ({ content, fileName }) => {
  // 各要素に対して、ブロックコンテンツを分離
  const renderContent = parseContentBlocks(content);
  return (
    <div className="flex flex-col gap-2">
      {renderContent.map((item, index) => {
        return item.header === "math" ? (
          <UvHMathBlockRenderer expression={item.content} alt={item.alt} fileName={`${fileName}-${index}`}  key={`${fileName}-${index}`}/>
        ) : item.header === "code" ? (
          <UvHCodeBlockRenderer code={item.content} lang={item.alt} />
        ) : item.header === "table" ? (
          <UvHTableRenderer tableString={item.content} key={`${fileName}-${index}`}/>
        ) : item.header === "text" ? (
          <p key={index}>{item.content}</p>
        ) : (
          <div key={index}>Unknown content type</div>
        );
      })}
    </div>
  );
}
export default UvHContentRenderer;
// math, code, table, textブロックを分離
interface ContentBlock {
  header: "math" | "code" | "table" | "text";
  alt?: string;
  content: string;
}
export function parseContentBlocks(article: string): ContentBlock[] {
  // 結果となる配列
  const result: ContentBlock[] = [];

  // 数式は$$から$$、コードは```から```、表は[[[から]]]までとする。
  const boundaryPatterns = [
    { header: "math", start: "\\$\\$", end: "\\$\\$" },
    { header: "code", start: "```", end: "```" },
    { header: "table", start: "\\[\\[\\[", end: "\\]\\]\\]" },
  ];
  const regExBoundaryPatterns = new RegExp(
    "(" + boundaryPatterns.map(block => `${block.start}[^]*?${block.end}`).join('|') + "|[^]+?(?=" + boundaryPatterns.map(block => block.start).join('|') + "|$))",
    "gs"
  );

  // 入力をスプリット
  const splitArtticle = article.match(regExBoundaryPatterns);

  // 各要素にヘッダーを追加し、ContentBlockへ整形
  splitArtticle?.forEach((part) => {
    for (const pattern of boundaryPatterns) {
      // ブロックの識別子を取り出し
      const startPattern = new RegExp(`^${pattern.start}`);
      const endPattern = new RegExp(`${pattern.end}`);

      if (startPattern.test(part) && endPattern.test(part)) {
        // 識別子の文字数を計算
        const startLength = pattern.start.replace(/\\/g, "").length;
        const endLength = pattern.end.replace(/\\/g, "").length;

        // 識別子を取り除く
        const idRemoved = part.slice(startLength, -endLength);
        // 一行目を取得
        const newlineIndex = idRemoved.indexOf("\n");
        const [alt, content] = [idRemoved.slice(0, newlineIndex), idRemoved.slice(newlineIndex + 1)];

        // 結果をプッシュ
        result.push({
          header: pattern.header as "math" | "code" | "table",
          content: content,
          alt: alt
        })
        return;
      }
    }
    // もしまだプッシュされていない場合は通常のtextとして返す
    if(part !== "" && part) {
      result.push({
        header: "text",
        content: part
      });
    }
  })
  return result;
}
