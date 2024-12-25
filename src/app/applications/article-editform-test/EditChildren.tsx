// EditChildren.tsx

"use client";

import { useState } from "react";

import { Section, Lv1Block } from "./article-edit-type"

import childrenSample from "./sample-article";

interface EditChildrenProps {
  children: Section[];
  onChildrenChange: (updateChildren: Section[]) => void;
}

const EditChildren: React.FC<EditChildrenProps> = ({ children: initialChildren, onChildrenChange }) => {
  // 状態管理
  const [children, setChildren] = useState<Section[]>(childrenSample);
  const [editingPath, setEditingPath] = useState<number[]>([0]);
  
  // ID生成関数: パスとタイプ名を受け取り、文字列を返す
  const generateId = (path: number[], type: string) => {
    return `${type}:${path.join("-")}`
  }



  return (
    <div>
      本　編：
      {children.length > 0 && children.map((child, index) => (
        <RenderBlockEditor path={`${index}`} block={children[index]} key={index} />
      ))}
    </div>
  )
}

export default EditChildren;



interface RenderBlockEditorProps {
  path: string;
  block: Lv1Block;
}

const RenderBlockEditor: React.FC<RenderBlockEditorProps> = ({ path, block: initialBlock }) => {
  const { type, content } = initialBlock;
  let children = undefined;
  if (initialBlock.children){
    children = initialBlock.children;
  }

  return (
    <div id={`${type}:${path}`} className="ml-4 border mt-4 mb-1">
      <p className="custom-font">{path}: {type}</p>

      {/* 子要素がある場合 */}
      {children && children.map((child, index) => {
        const childPath = `${path}-${index}`;
        return (
          <RenderBlockEditor path={childPath} block={child} key={index} />
        );
      })}
    </div>
  );
}