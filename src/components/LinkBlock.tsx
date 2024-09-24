/*
  * src/components/LinkBlock.tsx
  * リンクのpathとiconのpathを受け取り、リンクのブロックを表示する
*/
import React from 'react';
import Link from 'next/link';

import { PageLink } from "../types/UvHTypes";


interface Props {
  pageLink: PageLink;
}

// React.FCを使って型を定義
const LinkBlock: React.FC<Props> = ({ pageLink }) => {
  return (
    <Link href={pageLink.href}>
      <div
        className="text-center border border-gray-300 rounded-lg p-4 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
      >
        <img
          src={pageLink.icon}
          alt={`${pageLink.label} icon`}
          className="mx-auto mb-2"
        />
        <span className="text-lg font-medium">{pageLink.label}</span>
      </div>
    </Link>
  );
};

export default LinkBlock;