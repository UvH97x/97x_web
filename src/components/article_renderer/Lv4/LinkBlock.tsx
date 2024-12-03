// LinkBlock.tsx

const LinkBlock: React.FC<{ content: {alt: string, src: string} }> = ({ content }) => {
  const { alt, src } = content;
  return (
    <a href={src} className="text-blue-500 underline">
      {alt}
    </a>
  );
};

export default LinkBlock;