import { Button } from "@/components/ui/button"
import { Database, FileSpreadsheet, Layout, Share2, FileJson, Image, FileText, Trash2, Upload } from 'lucide-react'

interface SidebarProps {
  exportToPng: () => void;
  exportToJson: () => void;
  exportToTxt: () => void;
  importData: (file: File) => void;
  toggleDeleteMode: () => void;
  isDeleteMode: boolean;
}

const nodeTypes = [
  { type: 'process', icon: Share2, label: 'Process' },
  { type: 'database', icon: Database, label: 'Database' },
  { type: 'application', icon: Layout, label: 'Application' },
  { type: 'schema', icon: FileSpreadsheet, label: 'Schema' },
]

export default function Sidebar({ exportToPng, exportToJson, exportToTxt, importData, toggleDeleteMode, isDeleteMode }: SidebarProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <aside className="w-64 bg-muted p-4 flex flex-col h-full">
      <div className="flex-grow">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        <div className="space-y-2">
          {nodeTypes.map((node) => (
            <div
              key={node.type}
              className="flex items-center p-2 bg-background rounded shadow cursor-move"
              onDragStart={(event) => onDragStart(event, node.type)}
              draggable
            >
              <node.icon className="w-6 h-6 mr-2" />
              <span>{node.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <h2 className="text-lg font-semibold mb-4">Import/Export Options</h2>
        <div className="space-y-2">
          <Button onClick={() => document.getElementById('file-upload')?.click()} className="w-full justify-start">
            <Upload className="w-4 h-4 mr-2" />
            Import Previous Model
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button onClick={exportToPng} className="w-full justify-start">
            <Image aria-label="Export to PNG icon"className="w-4 h-4 mr-2" />
            Export to PNG
          </Button>
          <Button onClick={exportToJson} className="w-full justify-start">
            <FileJson aria-label="Export to JSON icon" className="w-4 h-4 mr-2" />
            Export to JSON
          </Button>
          <Button onClick={exportToTxt} className="w-full justify-start">
            <FileText aria-label="Export to TXT icon" className="w-4 h-4 mr-2" />
            Export to TXT
          </Button>
          <Button onClick={toggleDeleteMode} variant={isDeleteMode ? "destructive" : "secondary"} className="w-full justify-start">
            <Trash2 aria-label="Delete Mode icon" className="w-4 h-4 mr-2" />
            {isDeleteMode ? "Exit Delete Mode" : "Enter Delete Mode"}
          </Button>
        </div>
      </div>
    </aside>
  )
}
