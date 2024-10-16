import React, { useState, useCallback } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, MarkerType } from 'reactflow';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReactFlow, Edge } from 'reactflow';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
        onValueChange={(value: string) => {
          if (value === 'none') {
            handleChange({ markerEnd: undefined, markerStart: undefined });
          } else if (value === 'start') {
            handleChange({ markerEnd: undefined, markerStart: { type: MarkerType.ArrowClosed } });
          } else if (value === 'end') {
            handleChange({ markerEnd: { type: MarkerType.ArrowClosed }, markerStart: undefined });
          } else if (value === 'both') {
            handleChange({ markerEnd: { type: MarkerType.ArrowClosed }, markerStart: { type: MarkerType.ArrowClosed } });
          }
        }}
        value={
          edge.markerEnd && edge.markerStart ? 'both' :
          edge.markerEnd ? 'end' :
          edge.markerStart ? 'start' : 'none'
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Arrow Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Arrow</SelectItem>
          <SelectItem value="start">Start Arrow</SelectItem>
          <SelectItem value="end">End Arrow</SelectItem>
          <SelectItem value="both">Both Arrows</SelectItem>
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
      <div className="flex items-center space-x-2">
        <Switch
          id="animated"
          checked={edge.animated}
          onCheckedChange={(checked) => handleChange({ animated: checked })}
        />
        <Label htmlFor="animated">Animated</Label>
      </div>
    </div>
  );
};

const CustomEdge: React.FC<EdgeProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setEdges } = useReactFlow();
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, markerStart, animated } = props;
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
    setEdges((eds) => eds.map((e) => {
      if (e.id === newEdge.id) {
        return { ...e, ...newEdge };
      }
      return e;
    }));
  }, [setEdges]);

  return (
    <>
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${animated ? 'react-flow__edge-path-animated' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
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
