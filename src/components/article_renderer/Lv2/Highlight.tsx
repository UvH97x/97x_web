// Highlight.tsx

import React from "react";
import { FaExclamationTriangle, FaInfoCircle, FaLightbulb, FaCoffee } from "react-icons/fa";

import Renderer from "../Renderer";

// React.FCの型を定義
const Highlight: React.FC<{ content: any; children: any[] }> = ({ content, children }) => {
  // スタイルとアイコンのマッピング
  const styleMap: Record<string, { container: string; icon: React.ReactNode }> = {
    warning: {
      container: "bg-yellow-50 border-l-4 border-yellow-500 shadow-md",
      icon: <FaExclamationTriangle className="text-yellow-500 mr-2" />,
    },
    info: {
      container: "bg-blue-50 border-l-4 border-blue-500 shadow-md",
      icon: <FaInfoCircle className="text-blue-500 mr-2" />,
    },
    note: {
      container: "bg-green-50 border-l-4 border-green-500 shadow-md",
      icon: <FaLightbulb className="text-green-500 mr-2" />,
    },
    "coffee-break": {
      container: "bg-gray-50 border-l-4 border-gray-500 shadow-md",
      icon: <FaCoffee className="text-gray-500 mr-2" />,
    },
  };

  const selectedStyle = styleMap[content.style] || { container: "", icon: null };

  return (
    <div className={`my-6 p-4 rounded-lg flex flex-row items-start ${selectedStyle.container}`}>
      <div className="w-6">
        {/* アイコンを左側に配置 */}
        {selectedStyle.icon}
      </div>
      
      {/* コンテンツのレンダリング */}
      <div className="flex-grow">
        {children && children.map((child, idx) => <Renderer key={idx} data={child} />)}
      </div>
    </div>
  );
};

export default Highlight;
