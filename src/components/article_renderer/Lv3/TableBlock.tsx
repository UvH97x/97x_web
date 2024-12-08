// TableBlock.tsx

import React from "react";

import TextBlock from "../Lv4/TextBlock";
import CopyableBlock from "./CopyableBlock";

const TableBlock: React.FC<{ content: any }> = ({ content }) => {
  const { id, alt, cells: tableData } = content;

  const copyContent = tableData
  .map((row: string[]) => row.join(",")) // 各行の要素をカンマで結合
  .join("\n"); // 各行を改行で結合

  return (
    <CopyableBlock id={id} content={copyContent} buttonString="Copy CSV">
    {alt && (
      <p className="text-sm text-gray-700">
        {alt}
      </p>
    )}
    <div id={id} className="overflow-x-auto">
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
        <thead>
          {/* ヘッダー行 (最初の行をヘッダーとして扱う例) */}
          <tr className="">
            {tableData[0]?.map((header: string, cellIndex: number) => (
              <th
                key={`header-${cellIndex}`}
                className="border border-gray-500 text-gray-800 text-center text-lg bg-gray-400"
              >
                <TextBlock content={{expression: header, style: ""}}/>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row: string[], rowIndex: number) => (
            <tr
              key={`row-${rowIndex}`}
              className={rowIndex % 2 === 0 ? "bg-white md:hover:bg-gray-100" : "bg-gray-100 md:hover:bg-gray-200"}
            >
              {row.map((cell: string, cellIndex: number) => (
                <td
                  key={`row-${rowIndex}-cell-${cellIndex}`}
                  className="border border-gray-400 px-4 py-2 text-center"
                >
                  <TextBlock content={{expression: cell, style: ""}}/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </CopyableBlock>
  );
};

export default TableBlock;
