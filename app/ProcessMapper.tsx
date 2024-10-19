"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { User } from '@supabase/supabase-js';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowInstance,
  MarkerType,
  NodeMouseHandler,
  EdgeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { toPng } from 'html-to-image'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import ProcessNode from './ProcessNode'
import DatabaseNode from './DatabaseNode'
import ApplicationNode from './ApplicationNode'
import SchemaNode from './SchemaNode'
import CustomEdge from './CustomEdge'
import Sidebar from './Sidebar'
import SchemaEditor from './SchemaEditor'
import TextNode from './TextNode'
import FlowsModal from '@/components/FlowsModal'

// const nodeTypes = {
//   process: ProcessNode,
//   database: DatabaseNode,
//   application: ApplicationNode,
//   schema: SchemaNode,
//   text: TextNode,
// }

const edgeTypes = {
  custom: CustomEdge,
};

interface ProcessMapperProps {
  user: User | null
}

export default function ProcessMapper({ user }: ProcessMapperProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const { project } = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [nodeLabel, setNodeLabel] = useState('');
  const { toast } = useToast()
  const [fontSize, setFontSize] = useState('16px');
  const [fontWeight, setFontWeight] = useState('normal');

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  const [isFlowsModalOpen, setIsFlowsModalOpen] = useState(false);

  const handleManageFlows = () => {
    setIsFlowsModalOpen(true);
  };

  const handleSaveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      return JSON.stringify(flow);
    }
    return '';
  }, [reactFlowInstance]);

  const handleLoadFlow = useCallback((flowData: string) => {
    try {
      const flow = JSON.parse(flowData);
      if (flow.nodes && flow.edges) {
        setNodes(flow.nodes);
        setEdges(flow.edges);
        toast({
          title: "Success",
          description: "Flow loaded successfully.",
        });
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      toast({
        title: "Error",
        description: "Failed to load flow.",
        variant: "destructive",
      });
    }
  }, [setNodes, setEdges, toast]);

  const onConnect = useCallback((params: Connection) => {
    // Ensure that source and target are strings
    if (params.source && params.target) {
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'custom', // This ensures all edges use our CustomEdge component
        animated: true, // Set animated to true by default
        style: { stroke: '#999', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
        data: { text: '' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    }
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const updateNodeLabel = useCallback((id: string, newLabel: string, newFontSize?: string, newFontWeight?: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              fontSize: newFontSize || node.data.fontSize,
              fontWeight: newFontWeight || node.data.fontWeight,
            }
          };
        }
        return node;
      })
    );
    setNodeLabel(newLabel);
    if (newFontSize) setFontSize(newFontSize);
    if (newFontWeight) setFontWeight(newFontWeight);
  }, [setNodes]);

  const createNode = useCallback((type: string, position: { x: number, y: number }) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: type === 'text' ? 'Click to edit' : `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        onChange: (newLabel: string, newFontSize?: string, newFontWeight?: string) => 
          updateNodeLabel(newNode.id, newLabel, newFontSize, newFontWeight),
        fontSize: '16px',
        fontWeight: 'normal',
      },
    }

    return newNode;
  }, [updateNodeLabel]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = createNode(type, position);
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, createNode]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (isDeleteMode) {
      setNodes((nds) => nds.filter((n) => n.id !== node.id))
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id))
    } else {
      setSelectedNode(node)
    }
  }, [isDeleteMode, setNodes, setEdges])

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (isDeleteMode) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
    } else {
      // Toggle edge selection
      setEdges((eds) => 
        eds.map((e) => 
          e.id === edge.id ? { ...e, selected: !e.selected } : { ...e, selected: false }
        )
      );
    }
  }, [isDeleteMode, setEdges])

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type !== 'text') {
      setSelectedNode(node);
      setNodeLabel(node.data.label);
      setIsDialogOpen(true);
    }
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu({ x: 0, y: 0, visible: false });
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if the active element is an input or textarea
    const isEditingText = ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName);

    if ((event.key === 'Delete' || event.key === 'Backspace') && !isEditingText) {
      if (selectedNode) {
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
        setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id))
        setSelectedNode(null)
      }
      // Add this part to delete selected edges
      setEdges((eds) => eds.filter((e) => !e.selected))
    }
  }, [selectedNode, setNodes, setEdges])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  const exportToPng = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    toPng(reactFlowWrapper.current, { backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'process-map.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error exporting to PNG:', err);
      });
  }, []);

  const exportToJson = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      const jsonString = JSON.stringify(flow, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'process-map.json'
      link.href = url
      link.click()
    }
  }, [reactFlowInstance])

  const exportToTxt = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      let txtContent = "C4 Diagram:\n\n"

      // Add nodes
      txtContent += "Components:\n"
      flow.nodes.forEach((node) => {
        txtContent += `- ${node.data.label} (${node.type})\n`
        if (node.data.columns) {
          txtContent += "  Columns:\n"
          node.data.columns.forEach((column: { name: string, type: string }) => {
            txtContent += `    - ${column.name}: ${column.type}\n`
          })
        }
      })

      // Add edges
      txtContent += "\nRelationships:\n"
      flow.edges.forEach((edge) => {
        const sourceNode = flow.nodes.find(n => n.id === edge.source)
        const targetNode = flow.nodes.find(n => n.id === edge.target)
        if (sourceNode && targetNode) {
          txtContent += `- ${sourceNode.data.label} -> ${targetNode.data.label}\n`
        }
      })

      const blob = new Blob([txtContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'process-map.txt'
      link.href = url
      link.click()
    }
  }, [reactFlowInstance])

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
            toast({
              title: "Import Successful",
              description: "JSON data has been imported successfully.",
            });
          } else {
            throw new Error('Invalid JSON format');
          }
        } else if (file.name.endsWith('.txt')) {
          // Implement C4 model text parsing logic here
          // This is a placeholder and needs to be implemented based on your C4 model text format
          const parsedData = parseC4ModelText(text);
          setNodes(parsedData.nodes);
          setEdges(parsedData.edges);
          toast({
            title: "Import Successful",
            description: "C4 model data has been imported successfully.",
          });
        } else {
          throw new Error('Unsupported file format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: "Import Failed",
          description: "There was an error importing the data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges, toast]);

  // Placeholder function for parsing C4 model text
  const parseC4ModelText = (text: string) => {
    // This is a placeholder implementation
    console.log("Parsing C4 model text:", text);
    // You should implement the actual parsing logic here
    return { nodes: [], edges: [] };
  };

  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDialogKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.stopPropagation();
      }
    };

    const dialogContent = dialogContentRef.current;
    if (dialogContent) {
      dialogContent.addEventListener('keydown', handleDialogKeyDown);
    }

    return () => {
      if (dialogContent) {
        dialogContent.removeEventListener('keydown', handleDialogKeyDown);
      }
    };
  }, []);

  interface Column {
    name: string;
    type: string;
  }

  const nodeTypes = useMemo(() => ({
    process: ProcessNode,
    database: DatabaseNode,
    application: ApplicationNode,
    schema: SchemaNode,
    text: TextNode,
  }), []);

  // Add this function
  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode((prev) => !prev);
  }, []);

  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setSelectedNode(node);
      setContextMenu({ x: event.clientX, y: event.clientY, visible: true });
    },
    [setSelectedNode]
  );

  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();
      setEdges((eds) => eds.map((e) => ({...e, selected: e.id === edge.id})));
      setContextMenu({ x: event.clientX, y: event.clientY, visible: true });
    },
    [setEdges]
  );

  const duplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `${selectedNode.type}-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    }
  }, [selectedNode, setNodes]);

  const deleteSelectedElements = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex">
        <Sidebar
          exportToPng={exportToPng}
          exportToJson={exportToJson}
          exportToTxt={exportToTxt}
          importData={importData}
          toggleDeleteMode={toggleDeleteMode}
          isDeleteMode={isDeleteMode}
          onManageFlows={handleManageFlows}
          user={user}
        />
        <div className="flex-grow" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={12} size={1} />
          </ReactFlow>
          {contextMenu.visible && (
            <div
              style={{
                position: 'absolute',
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 1000,
              }}
              className="bg-white border rounded shadow-md p-2"
            >
              {selectedNode && (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={duplicateNode}
                  >
                    Duplicate
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={deleteSelectedElements}
                  >
                    Delete
                  </button>
                </>
              )}
              {!selectedNode && (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={deleteSelectedElements}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog 
        open={isDialogOpen && selectedNode?.type !== 'text'} 
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent ref={dialogContentRef}>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogDescription>
              Update the details for this node.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                onBlur={() => {
                  if (selectedNode) {
                    updateNodeLabel(selectedNode.id, nodeLabel);
                  }
                }}
                className="col-span-3"
              />
            </div>
            {selectedNode?.type === 'text' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fontSize" className="text-right">
                    Font Size
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setFontSize(value);
                      updateNodeLabel(selectedNode.id, nodeLabel, value, fontWeight);
                    }}
                    value={fontSize}
                  >
                    <SelectTrigger className="w-full col-span-3">
                      <SelectValue placeholder="Font Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12px">Small</SelectItem>
                      <SelectItem value="16px">Medium</SelectItem>
                      <SelectItem value="20px">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fontWeight" className="text-right">
                    Font Weight
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setFontWeight(value);
                      updateNodeLabel(selectedNode.id, nodeLabel, fontSize, value);
                    }}
                    value={fontWeight}
                  >
                    <SelectTrigger className="w-full col-span-3">
                      <SelectValue placeholder="Font Weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {(selectedNode?.type === 'database' || selectedNode?.type === 'schema') && (
              <SchemaEditor
                nodeId={selectedNode.id}
                columns={selectedNode.data.columns || []}
                onColumnsChange={(newColumns: Column[]) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, columns: newColumns } }
                        : node
                    )
                  );
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <FlowsModal
        isOpen={isFlowsModalOpen}
        onClose={() => setIsFlowsModalOpen(false)}
        onSaveFlow={handleSaveFlow}
        onLoadFlow={handleLoadFlow}
      />
    </div>
  )
}
