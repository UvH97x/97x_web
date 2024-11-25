// LinkBlock.tsx

const LinkBlock: React.FC<{ content: any }> = ({ content }) => {
  return (
    <a href={content.href} className="text-blue-500 underline">
      {content.content}
    </a>
  );
};

export default LinkBlock;