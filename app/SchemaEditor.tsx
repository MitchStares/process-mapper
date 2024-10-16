import { useState, useEffect } from 'react'
import { useReactFlow } from 'reactflow'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2 } from 'lucide-react'

interface Column {
  name: string;
  type: string;
}

interface SchemaEditorProps {
  nodeId: string;
  columns: Column[];
  onColumnsChange: (newColumns: Column[]) => void;
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({ nodeId, columns: initialColumns, onColumnsChange }) => {
  const { getNode, setNodes } = useReactFlow()
  const [columnsState, setColumnsState] = useState<Column[]>(initialColumns)

  useEffect(() => {
    const node = getNode(nodeId)
    if (node) {
      setColumnsState(node.data.columns || [])
    }
  }, [nodeId, getNode])

  const updateNodeData = (newColumns: Column[]) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, columns: newColumns } }
        }
        return node
      })
    )
    onColumnsChange(newColumns)
  }

  const handleAddColumn = () => {
    const newColumns = [...columnsState, { name: '', type: '' }]
    setColumnsState(newColumns)
    updateNodeData(newColumns)
  }

  const handleRemoveColumn = (index: number) => {
    const newColumns = columnsState.filter((_, i) => i !== index)
    setColumnsState(newColumns)
    updateNodeData(newColumns)
  }

  const handleColumnChange = (index: number, field: 'name' | 'type', value: string) => {
    const newColumns = columnsState.map((column, i) => {
      if (i === index) {
        return { ...column, [field]: value }
      }
      return column
    })
    setColumnsState(newColumns)
    updateNodeData(newColumns)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Columns</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columnsState.map((column, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={column.name}
                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                    placeholder="Column name"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                    placeholder="Data type"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveColumn(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={handleAddColumn} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add Column
        </Button>
      </div>
    </div>
  )
}

export default SchemaEditor
