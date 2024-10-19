"use client"

import { ReactFlowProvider } from 'reactflow'
import ProcessMapper from './ProcessMapper'
import HelpGuide from './HelpGuide'
import AuthModal from '@/components/AuthModal'

export default function App() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">Data Process Mapper</h1>
        <AuthModal />
        <HelpGuide />
      </header>
      <main className="flex-grow">
        <ReactFlowProvider>
          <ProcessMapper />
        </ReactFlowProvider>
      </main>
    </div>
  )
}