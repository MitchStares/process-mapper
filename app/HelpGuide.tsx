import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 right-28 z-50">
          <HelpCircle className="h-6 w-6" />
          <span className="sr-only">Open help guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Data Process Mapper Help Guide</DialogTitle>
          <DialogDescription>
            Learn how to use the Data Process Mapper effectively.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <section>
              <h3 className="text-lg font-semibold">Getting Started</h3>
              <p>Welcome to the Data Process Mapper! This tool helps you visualize and design data processes using a drag-and-drop interface.</p>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Components</h3>
              <ul className="list-disc pl-6">
                <li><strong>Process:</strong> Represents a data processing step.</li>
                <li><strong>Database:</strong> Represents a database or data storage.</li>
                <li><strong>Application:</strong> Represents an application in your data flow.</li>
                <li><strong>Schema:</strong> Represents a data schema or structure.</li>
                <li><strong>Text Annotation:</strong> Adds explanatory text to your diagram.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Creating a Flow</h3>
              <ol className="list-decimal pl-6">
                <li>Drag components from the left sidebar onto the canvas.</li>
                <li>Connect components by clicking and dragging from one node&apos;s handle to another.</li>
                <li>Customize node properties by double clicking on a node and using the properties panel.</li>
                <li>Customize connection properties by clicking on a connection and using the properties panel.</li>
                <li>Right click on a node or connection to open the delete menu.</li>
              </ol>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Import/Export Options</h3>
              <ul className="list-disc pl-6">
                <li><strong>Import Previous Model:</strong> Load a previously saved model (Only JSON format supported currently).</li>
                <li><strong>Export to PNG:</strong> Save your diagram as an image.</li>
                <li><strong>Export to JSON:</strong> Save your diagram data for later use.</li>
                <li><strong>Export to TXT:</strong> Export your diagram data as plain text C4 Model.</li>
              </ul>
            </section>
            <section>
              <h3 className="text-lg font-semibold">Tips and Tricks</h3>
              <ul className="list-disc pl-6">
                <li>Use the zoom and pan controls to navigate large diagrams.</li>
                <li>Group related nodes to keep your diagram organized.</li>
                <li>Use text annotations to add context to your diagram.</li>
                <li>Regularly save your work using the export options.</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}