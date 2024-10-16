import React, { useState } from 'react';
import { Handle, Position, NodeProps, useStore } from 'reactflow';
import { FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { ReactFlowState } from 'reactflow';

interface Column {
  name: string;
  type: string;
}

interface SchemaNodeData {
  label: string;
  columns?: Column[];
}

const selector = (state: ReactFlowState) => ({
  selectedNodes: state.nodeInternals
    ? Array.from(state.nodeInternals.values()).filter(node => node.selected)
    : [],
});

const SchemaNode: React.FC<NodeProps<SchemaNodeData>> = ({ id, data, isConnectable }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedNodes } = useStore(selector);
  const isSelected = selectedNodes.some((node) => node.id === id);

  return (
    <div 
      className={`
        shadow-md rounded-md bg-white border-2 
        ${isSelected ? 'border-gray-800' : 'border-gray-400'}
        hover:border-gray-600 transition-colors duration-300
      `}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2" />
            <span className="text-sm font-bold">{data.label}</span>
          </div>
          {data.columns && data.columns.length > 0 && (
            <button onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
      </div>
      {isExpanded && data.columns && (
        <div className="px-4 py-2 border-t border-gray-200">
          {data.columns.map((column: Column, index: number) => (
            <div key={index} className="text-xs">
              {column.name}: {column.type}
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default SchemaNode;
