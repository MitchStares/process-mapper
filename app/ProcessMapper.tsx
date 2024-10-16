"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
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
  NodeResizer,
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

import ProcessNode from './ProcessNode'
import DatabaseNode from './DatabaseNode'
import ApplicationNode from './ApplicationNode'
import SchemaNode from './SchemaNode'
import CustomEdge from './CustomEdge'
import Sidebar from './Sidebar'
import SchemaEditor from './SchemaEditor'

const nodeTypes = {
  process: ProcessNode,
  database: DatabaseNode,
  application: ApplicationNode,
  schema: SchemaNode,
}

const edgeTypes = {
  custom: CustomEdge,
};

export default function ProcessMapper() {
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

  const onConnect = useCallback((params: Edge | Connection) => {
    const newEdge = {
      ...params,
      type: 'custom',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
    }
    setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges])

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const updateNodeLabel = useCallback((id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      })
    );
    setNodeLabel(newLabel);
  }, [setNodes]);

  const createNode = useCallback((type: string, position: { x: number, y: number }) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onLabelChange: (_newLabel: string) => {} // Use underscore to indicate unused parameter
      },
    };
    return newNode;
  }, []);

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
      newNode.data.onLabelChange = (newLabel: string) => updateNodeLabel(newNode.id, newLabel);
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, createNode, updateNodeLabel]
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
    }
  }, [isDeleteMode, setEdges])

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeLabel(node.data.label);
    setIsDialogOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

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

  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode((prev) => !prev)
  }, [])

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

  interface Column {
    name: string;
    type: string;
  }

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
            fitView
          >
            <Controls />
            <MiniMap />
            <Background color="#aaa" gap={12} size={1} />
            {nodes.map((node) => (
              <NodeResizer
                key={node.id}
                nodeId={node.id}
                isVisible={selectedNode?.id === node.id}
                minWidth={100}
                minHeight={50}
              />
            ))}
            
          </ReactFlow>
        </div>
      </div>
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onKeyDown={(e) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.stopPropagation();
          }
        }}
      >
        <DialogContent>
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
    </div>
  )
}
