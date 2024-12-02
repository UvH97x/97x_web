// TextBlock.tsx

const TextBlock: React.FC<{ content: any }> = ({ content }) => {
  const { expression: text, style } = content;

  return (
    <span className={style}>
      {text}
    </span>
  );
};

export default TextBlock;