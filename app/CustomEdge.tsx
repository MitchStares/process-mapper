import React, { useState, useCallback } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, MarkerType, useReactFlow, Edge } from 'reactflow';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Define a custom type that extends EdgeProps
interface CustomEdgeProps extends EdgeProps {
  type?: string;
}

const EdgeControls: React.FC<{ edge: Edge; onChange: (newEdge: Edge) => void }> = ({ edge, onChange }) => {
  const [edgeText, setEdgeText] = useState(edge.data?.text || '');

  const handleChange = useCallback((newStyle: Partial<Edge>) => {
    onChange({ ...edge, ...newStyle });
  }, [edge, onChange]);

  const handleTextChange = useCallback(() => {
    onChange({ ...edge, data: { ...edge.data, text: edgeText } });
  }, [edge, edgeText, onChange]);

  const getArrowValue = () => {
    if (edge.markerStart && edge.markerEnd) return 'both';
    if (edge.markerStart) return 'start';
    if (edge.markerEnd) return 'end';
    return 'none';
  };

  return (
    <div className="flex flex-col space-y-2">
      <Select
        onValueChange={(value: string) => {
          let newEdge: Partial<Edge> = {};
          switch (value) {
            case 'none':
              newEdge = { markerStart: undefined, markerEnd: undefined };
              break;
            case 'start':
              newEdge = { markerStart: { type: MarkerType.ArrowClosed }, markerEnd: undefined };
              break;
            case 'end':
              newEdge = { markerStart: undefined, markerEnd: { type: MarkerType.ArrowClosed } };
              break;
            case 'both':
              newEdge = { markerStart: { type: MarkerType.ArrowClosed }, markerEnd: { type: MarkerType.ArrowClosed } };
              break;
          }
          handleChange(newEdge);
        }}
        value={getArrowValue()}
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
      <div className="flex items-center space-x-2">
        <Input
          value={edgeText}
          onChange={(e) => setEdgeText(e.target.value)}
          placeholder="Edge Text"
        />
        <Button onClick={handleTextChange}>Set Text</Button>
      </div>
    </div>
  );
};

const CustomEdge: React.FC<CustomEdgeProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setEdges } = useReactFlow();
  const { 
    id, 
    sourceX, 
    sourceY, 
    targetX, 
    targetY, 
    sourcePosition, 
    targetPosition, 
    style = {}, 
    markerEnd,
    markerStart,
    data,
    animated
  } = props;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = useCallback((evt: React.MouseEvent<SVGGElement, MouseEvent>) => {
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

  // Calculate the angle of the line
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <>
      <g onClick={onEdgeClick}>
        {/* Invisible wider path for better click detection */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          className="react-flow__edge-interaction"
        />
        {/* Visible edge path */}
        <path
          id={id}
          style={style}
          className={`react-flow__edge-path ${animated ? 'react-flow__edge-path-animated' : ''}`}
          d={edgePath}
          markerEnd={markerEnd}
          markerStart={markerStart}
        />
      </g>
      {data?.text && (
        <g transform={`translate(${(sourceX + targetX) / 2}, ${(sourceY + targetY) / 2})`}>
          <rect
            x="-2"
            y="-10"
            width={data.text.length * 8 + 4}
            height="20"
            fill="white"
            stroke="none"
          />
          <text
            style={{
              fontSize: 12,
              textAnchor: 'middle',
              alignmentBaseline: 'middle',
              transform: `rotate(${angle < 90 && angle > -90 ? angle : angle - 180}deg)`,
            }}
          >
            {data.text}
          </text>
        </g>
      )}
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
