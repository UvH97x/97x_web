/**
 * UvHTableRenderer.tsx
 * 
 * このファイルは、単なる文字列を受け取り、テーブルをレンダリングするReactコンポーネント "DynamicTable" を実装しています。
 * 文字列はカンマで区切られた列データを持つ行データとして解析されます。
 * 
 * @component
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.tableString - テーブルデータを含む文字列。改行で行を区切り、カンマで列を区切ります。
 * 
 * @example
 * const tableData = `
 *   Col 1, Col 2, Col 3
 *   A1, B1, C1
 *   A2, B2, C2
 *   A3, B3, C3
 * `;
 * 
 * <DynamicTable tableString={tableData} />
 * 
 * Tailwind CSS を使用しているため、必要に応じてスタイルをカスタマイズできます。
 */

import React from 'react';

interface UvHTableRendererProps {
  tableString: string;
}

const UvHTableRenderer: React.FC<UvHTableRendererProps> = ({ tableString }) => {
  // 文字列を行ごとに分割し、その後カンマで列を分割して2次元配列を生成
  const rows = tableString.trim().split('\n').map(row => row.trim().split(','));

  // 最初の行をヘッダーとして扱い、それ以降をテーブルの内容として扱う
  const tableHeader = rows.length > 0 ? rows[0] : [];
  const contents = rows.slice(1);

  return (
    <div className="overflow-auto">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            {tableHeader.map((header, index) => (
              <th key={index} className="border px-4 py-2">
                {header.trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contents.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border px-4 py-2">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UvHTableRenderer;
