import React from 'react'
import { Button } from "@/components/ui/button"
import { Database, FileSpreadsheet, Layout, Share2, ChevronRight, Menu, Type, Save, Upload, Image as ImageIcon, FileJson, FileText, Trash2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { User } from '@supabase/supabase-js';

const nodeTypes = [
  { type: 'process', icon: Share2, label: 'Process' },
  { type: 'database', icon: Database, label: 'Database' },
  { type: 'application', icon: Layout, label: 'Application' },
  { type: 'schema', icon: FileSpreadsheet, label: 'Schema' },
  { type: 'text', icon: Type, label: 'Text Annotation' },
]

interface SidebarProps {
  exportToPng: () => void;
  exportToJson: () => void;
  exportToTxt: () => void;
  importData: (file: File) => void;
  toggleDeleteMode: () => void;
  isDeleteMode: boolean;
  onManageFlows: () => void;
  user: User | null;
}

export default function Sidebar({ 
  exportToPng, 
  exportToJson, 
  exportToTxt, 
  importData, 
  toggleDeleteMode, 
  isDeleteMode, 
  onManageFlows, 
  user 
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)

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
    <aside className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
      isExpanded ? "w-64" : "w-20"
    )}>
      <div className="flex items-center justify-between p-4">
        {isExpanded && <h2 className="text-lg font-semibold text-gray-700">Components</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronRight className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {nodeTypes.map((node) => (
          <TooltipProvider key={node.type}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center p-3 rounded-lg shadow-sm cursor-move transition-all hover:shadow-md bg-gray-100",
                    isExpanded ? "justify-start" : "justify-center"
                  )}
                  onDragStart={(event) => onDragStart(event, node.type)}
                  draggable
                >
                  <node.icon className="w-6 h-6 text-gray-700" />
                  {isExpanded && (
                    <span className="ml-3 font-medium text-gray-700">{node.label}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Drag to add {node.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <div className="mt-auto p-4">
        <h2 className={cn("text-lg font-semibold text-gray-700 mb-4", !isExpanded && "sr-only")}>Import/Export Options</h2>
        <div className="space-y-2">
          {user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onManageFlows} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                    <Save className="w-4 h-4 mr-2" />
                    {isExpanded && "Manage Flows"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p>Manage Flows</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => document.getElementById('file-upload')?.click()} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isExpanded && "Import Previous Model"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Import Previous Model</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            id="file-upload"
            type="file"
            accept=".json,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={exportToPng} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                  <ImageIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {isExpanded && "Export to PNG"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Export to PNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={exportToJson} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                  <FileJson className="w-4 h-4 mr-2" />
                  {isExpanded && "Export to JSON"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Export to JSON</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={exportToTxt} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                  <FileText className="w-4 h-4 mr-2" />
                  {isExpanded && "Export to TXT"}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Export to TXT</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={toggleDeleteMode} variant={isDeleteMode ? "destructive" : "secondary"} className={cn("w-full justify-start", !isExpanded && "justify-center")}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isExpanded && (isDeleteMode ? "Exit Delete Mode" : "Enter Delete Mode")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>{isDeleteMode ? "Exit Delete Mode" : "Enter Delete Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </aside>
  )
}
