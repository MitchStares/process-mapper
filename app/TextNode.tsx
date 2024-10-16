import React from 'react';
import { NodeProps } from 'reactflow';

const TextNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="px-4 py-2">
      <span style={{ fontSize: data.fontSize, fontWeight: data.fontWeight }}>{data.label}</span>
    </div>
  );
};

export default TextNode;
