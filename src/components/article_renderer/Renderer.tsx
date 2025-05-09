import React from "react";

// Level 1
import Section from "./Lv1/Section";

// Level 2
import Fold from "./Lv2/Fold";
import Highlight from "./Lv2/Highlight";
import List from "./Lv2/List";
import Paragraph from "./Lv2/Paragraph";

// Level 3
import MathBlock from "./Lv3/MathBlock";
import CodeBlock from "./Lv3/CodeBlock";
import TableBlock from "./Lv3/TableBlock";
import ImageBlock from "./Lv3/ImageBlock";

// Level 4
import TextBlock from "./Lv4/TextBlock";
import LinkBlock from "./Lv4/LinkBlock";
import InlineMathComponent from "./Lv4/InlineMathComponent";


// Renderer コンポーネント
const Renderer: React.FC<{ data: any }> = ({ data }) => {
  const { type, content, children } = data;

  // 各typeに対応するコンポーネントを分岐
  switch (type) {
    case "section":
      return <Section content={content} children={children} />;
    case "paragraph":
      return <Paragraph content={content} children={children} />;
    case "fold":
      return <Fold content={content} children={children} />;
    case "highlight":
      return <Highlight content={content} children={children} />;
    case "list":
      return <List content={content} children={children} />;
    case "math":
      return <MathBlock content={content} />;
    case "code":
      return <CodeBlock content={content} />;
    case "table":
      return <TableBlock content={content} />;
    case "image":
      return <ImageBlock content={content} />;
    case "text":
      return <TextBlock content={content} />;
    case "link":
      return <LinkBlock content={content} />;
    case "inline-math":
      return <InlineMathComponent content={content} />;
    default:
      return <p>!no such type!</p>;
  }
};

export default Renderer;
