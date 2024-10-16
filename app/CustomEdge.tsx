import React, { useState, useCallback } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, MarkerType } from 'reactflow';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReactFlow, Edge } from 'reactflow';

const EdgeControls: React.FC<{ edge: Edge; onChange: (newEdge: Edge) => void }> = ({ edge, onChange }) => {
  const handleChange = useCallback((newStyle: Partial<Edge>) => {
    onChange({ ...edge, ...newStyle });
  }, [edge, onChange]);

  return (
    <div className="flex flex-col space-y-2">
      <Select
        onValueChange={(value: string) => handleChange({ type: value })}
        value={edge.type}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Edge Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="step">Step</SelectItem>
          <SelectItem value="smoothstep">Smooth Step</SelectItem>
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value: MarkerType) => handleChange({ markerEnd: { type: value } })}
        value={(edge.markerEnd as { type: string })?.type || MarkerType.ArrowClosed}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Arrow Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MarkerType.Arrow}>Single Arrow</SelectItem>
          <SelectItem value={MarkerType.ArrowClosed}>Double Arrow</SelectItem>
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value: string) => handleChange({ style: { ...edge.style, strokeDasharray: value } })}
        value={edge.style?.strokeDasharray?.toString() || "0"}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Line Style" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Solid</SelectItem>
          <SelectItem value="5,5">Dashed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const CustomEdge: React.FC<EdgeProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setEdges } = useReactFlow();
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeDoubleClick = useCallback((evt: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    evt.preventDefault();
    evt.stopPropagation();
    setIsOpen(true);
  }, []);

  const onChangeEdge = useCallback((newEdge: Edge) => {
    setEdges((eds) => eds.map((e) => (e.id === newEdge.id ? newEdge : e)));
  }, [setEdges]);

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onDoubleClick={onEdgeDoubleClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div style={{width: 0, height: 0}} />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <EdgeControls edge={props} onChange={onChangeEdge} />
            </PopoverContent>
          </Popover>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
