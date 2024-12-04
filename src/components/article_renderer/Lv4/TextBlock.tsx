// TextBlockコンポーネント

import InlineMathComponent from "./InlineMathComponent";
import LinkBlock from "./LinkBlock";


const TextBlock: React.FC<{ content: {expression: string, style: string} }> = ({ content }) => {
  const {expression, style} = content;

  // 正規表現で特定のパターンを解析
  const parsedContent = expression.split(/(\$.*?\$|```.*?```|___.*?___)/g);

  return (
    <span className={style}>
      {parsedContent.map((part, index) => {
        // InlineMath ($...$)
        if (part.startsWith("$") && part.endsWith("$")) {
          part=part.slice(1, -1);
          return (
            <InlineMathComponent key={index} content={{ expression: part }} />
          );
        }

        // InlineCode (```...```)
        if (part.startsWith("```") && part.endsWith("```")) {
          part = part.slice(3, -3);
          return (
            <span className="bg-gray-300 px-1 rounded">{part}</span>
          );
        }

        // Link (___...___)
        if (part.startsWith("___") && part.endsWith("___")) {
          const [alt, src] = part.slice(3, -3).split("|");
          return <LinkBlock key={index} content={{ alt, src }} />;
        }

        // 通常のテキスト
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default TextBlock;