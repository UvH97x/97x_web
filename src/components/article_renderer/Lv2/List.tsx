// List.tsx

import React from "react";

import Renderer from "../Renderer";

const List: React.FC<{ content: { style: "ordered" | "unordered" }; children: any[] }> = ({ content, children }) => {
  const ListTag = content.style === "ordered" ? "ol" : "ul";

  return (
    <ListTag className="list-inside list-disc my-4 pl-4">
      {children &&
        children.map((child, idx) => (
          <li key={idx}>
            <Renderer data={child} />
          </li>
        ))
      }
    </ListTag>
  );
};

export default List;
