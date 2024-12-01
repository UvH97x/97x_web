// TextBlock.tsx

const TextBlock: React.FC<{ content: any }> = ({ content }) => {
  const { content: text, style } = content;

  // `style`がundefinedの場合にデフォルト値を設定
  const effectiveStyle = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: "black",
    ...style, // `style`が定義されていれば上書きする
  };

  return (
    <span
      className={`${effectiveStyle.bold ? "font-bold" : ""} 
                  ${effectiveStyle.italic ? "italic" : ""} 
                  ${effectiveStyle.underline ? "underline" : ""} 
                  ${effectiveStyle.strikethrough ? "line-through" : ""}`}
      style={{ color: effectiveStyle.color }}
    >
      {text}
    </span>
  );
};

export default TextBlock;