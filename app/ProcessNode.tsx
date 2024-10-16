import React from 'react';
import { Handle, Position, NodeProps, useStore, ReactFlowState } from 'reactflow';
import { Share2 } from 'lucide-react';

// Remove or comment out the custom ReactFlowState interface
// interface ReactFlowState {
//   selectedElements: Array<{ id: string; type: string }> | null;
// }

const selector = (state: ReactFlowState) => ({
  selectedNodes: state.getNodes().filter(node => node.selected) || [],
});

const ProcessNode: React.FC<NodeProps> = ({ id, data, isConnectable }) => {
  const { selectedNodes } = useStore(selector);
  const isSelected = selectedNodes.some((node) => node.id === id);

  return (
    <div 
      className={`
        px-4 py-2 shadow-md rounded-md bg-white border-2 
        ${isSelected ? 'border-gray-800' : 'border-gray-400'}
        hover:border-gray-600 transition-colors duration-300
      `}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div className="flex items-center">
        <Share2 className="w-6 h-6 mr-2" />
        <span className="text-sm font-bold">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default ProcessNode;
