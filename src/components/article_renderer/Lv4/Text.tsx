// TextBlock.tsx

const TextBlock: React.FC<{ content: any }> = ({ content }) => {
  const { content: text, style } = content;

  return (
    <span
      className={`${style.bold ? "font-bold" : ""} 
                  ${style.italic ? "italic" : ""} 
                  ${style.underline ? "underline" : ""} 
                  ${style.strikethrough ? "line-through" : ""}`}
      style={{ color: style.color }}
    >
      {text}
    </span>
  );
};

export default TextBlock;