"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import ProcessMapper from './ProcessMapper'
import HelpGuide from './HelpGuide'
import AuthModal from '../components/AuthModal'
import { ReactFlowProvider } from 'reactflow'

export default function App() {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">Data Process Mapper</h1>
        <AuthModal />
        <HelpGuide />
      </header>
      <main className="flex-grow">
        <SessionContextProvider supabaseClient={supabaseClient}>
          <ReactFlowProvider>
            <ProcessMapper />
          </ReactFlowProvider>
        </SessionContextProvider>
      </main>
    </div>
  )
}
