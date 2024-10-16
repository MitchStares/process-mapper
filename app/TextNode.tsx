import React, { useState, useCallback, useEffect } from 'react';
import { NodeProps, NodeResizer, Handle, Position, NodeToolbar } from 'reactflow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TextNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label);
  const [fontSize, setFontSize] = useState(data.fontSize || '16px');
  const [fontWeight, setFontWeight] = useState(data.fontWeight || 'normal');

  useEffect(() => {
    setText(data.label);
    setFontSize(data.fontSize || '16px');
    setFontWeight(data.fontWeight || 'normal');
  }, [data.label, data.fontSize, data.fontWeight]);

  const onTextChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(evt.target.value);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditing(false);
    data.onChange(text, fontSize, fontWeight);
  }, [data, text, fontSize, fontWeight]);

  const onFontSizeChange = useCallback((value: string) => {
    setFontSize(value);
    data.onChange(text, value, fontWeight);
  }, [data, text, fontWeight]);

  const onFontWeightChange = useCallback((value: string) => {
    setFontWeight(value);
    data.onChange(text, fontSize, value);
  }, [data, text, fontSize]);

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={30} 
        isVisible={selected}
        lineClassName="border-blue-400" 
        handleClassName="h-3 w-3 bg-white border-2 rounded border-blue-400"
      />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex space-x-2 bg-white p-2 rounded shadow">
          <Select onValueChange={onFontSizeChange} value={fontSize}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Font Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12px">12px</SelectItem>
              <SelectItem value="14px">14px</SelectItem>
              <SelectItem value="16px">16px</SelectItem>
              <SelectItem value="18px">18px</SelectItem>
              <SelectItem value="20px">20px</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={onFontWeightChange} value={fontWeight}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Font Weight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </NodeToolbar>
      <div 
        className={`px-4 py-2 rounded transition-colors duration-200`}
        onClick={() => setIsEditing(true)}
        style={{ 
          width: '100%', 
          height: '100%', 
          fontSize: fontSize, 
          fontWeight: fontWeight,
          border: selected ? '1px dashed #3b82f6' : 'none',
        }}
      >
        {isEditing ? (
          <textarea
            value={text}
            onChange={onTextChange}
            onBlur={onBlur}
            autoFocus
            className="w-full h-full bg-transparent outline-none resize-none"
            style={{ fontSize: fontSize, fontWeight: fontWeight }}
          />
        ) : (
          <span>{text}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="b" style={{ visibility: 'hidden' }} />
    </>
  );
};

export default TextNode;
