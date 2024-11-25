// TableBlock.tsx

import React from "react";

import CopyableBlock from "./CopyableBlock";

const TableBlock: React.FC<{ content: any }> = ({ content }) => {
  const { id, alt, size, content: tableData } = content;

  const copyContent = tableData
  .map((row: string[]) => row.join(",")) // 各行の要素をカンマで結合
  .join("\n"); // 各行を改行で結合

  return (
    <CopyableBlock alt={alt} content={copyContent} buttonString="Copy CSV">
    <div id={id} className="overflow-x-auto">
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
        <thead>
          {/* ヘッダー行 (最初の行をヘッダーとして扱う例) */}
          <tr className="bg-gray-200 text-gray-800">
            {tableData[0]?.map((header: string, cellIndex: number) => (
              <th
                key={cellIndex}
                className="border border-gray-300 px-4 py-2 text-center font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row: string[], rowIndex: number) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {row.map((cell: string, cellIndex: number) => (
                <td
                  key={cellIndex}
                  className="border border-gray-300 px-4 py-2 text-center"
                >
                  {cell}
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
