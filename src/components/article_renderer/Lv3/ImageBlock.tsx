// ImageBlock.tsx

import React from "react";
import CopyableBlock from "./CopyableBlock";

const ImageBlock: React.FC<{ content: any }> = ({ content }) => {
  const { id, caption: description, src: imageUrl } = content;

  return (
    <CopyableBlock id={id} content={imageUrl} buttonString="Copy Image URL">
      <div id={id} className="bg-gray-100 text-center rounded">
        <img
          src={imageUrl}
          alt={description}
          className="w-full"
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
