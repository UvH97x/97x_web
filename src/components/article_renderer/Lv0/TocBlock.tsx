// TocBlock.tsx
import React from "react";

interface TocItem {
  id: string;
  title: string;
  depth: number;
}

const TocBlock: React.FC<{ tocBlock: TocItem[] }> = ({ tocBlock }) => {
  const sectionNumbers: number[] = [];

  return (
    <nav className="mt-6 mb-4 p-4 border rounded bg-gray-50 shadow-md">
      <h2 className="text-lg font-semibold mb-2">目次</h2>
      <ul className="space-y-1">
        {tocBlock.map((toc) => {
          // セクション番号の生成
          if (sectionNumbers.length < toc.depth) {
            sectionNumbers.push(1);
          } else {
            while (sectionNumbers.length > toc.depth) {
              sectionNumbers.pop();
            }
            sectionNumbers[sectionNumbers.length - 1]++;
          }
          const sectionNumber = sectionNumbers.join(".");

          return (
            <li
              key={toc.id}
              className={`ml-${toc.depth * 2}`}
            >
              <a
                href={`#${toc.id}`}
                className={`text-blue-500 hover:underline ${
                  toc.depth === 1 ? "font-semibold" : "font-normal"
                }`}
              >
                {sectionNumber} {toc.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TocBlock;
