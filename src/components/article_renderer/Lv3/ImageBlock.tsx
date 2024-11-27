// ImageBlock.tsx

import React from "react";
import CopyableBlock from "./CopyableBlock";

const ImageBlock: React.FC<{ content: any }> = ({ content }) => {
  const { id, alt: description, content: imageUrl } = content;

  return (
    <CopyableBlock id={id} content={imageUrl} buttonString="Copy Image URL">
      <div id={id} className="bg-gray-100 text-center p-2 rounded">
        <img
          src={imageUrl}
          alt={description}
          className="max-w-full h-auto mx-auto rounded"
          style={{
            width: "500px", // 横幅を500pxに固定
            height: "auto", // 縦横比を維持
            maxWidth: "100%" // 横幅がコンテナを超えないように
          }}
        />
        {description && (
          <p className="text-sm text-gray-700 mt-2">
            {description}
          </p>
        )}
      </div>
    </CopyableBlock>
  );
};

export default ImageBlock;
