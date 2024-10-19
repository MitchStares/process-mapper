"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import ProcessMapper from './ProcessMapper'
import HelpGuide from './HelpGuide'
import AuthModal from '../components/AuthModal'
import { ReactFlowProvider } from 'reactflow'

export default function App() {
  const [supabaseClient] = useState(() => createClientComponentClient())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      setUser(session?.user || null)
      setIsLoading(false)

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })

      return () => subscription.unsubscribe()
    }

    fetchSession()
  }, [supabaseClient])

  if (isLoading) {
    return <div>Loading...</div> // Or a more sophisticated loading component
  }

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <div className="h-screen flex flex-col">
        <header className="bg-primary text-primary-foreground p-4">
          <h1 className="text-2xl font-bold">Data Process Mapper</h1>
          <AuthModal user={user} setUser={setUser} />
          <HelpGuide />
        </header>
        <main className="flex-grow">
          <ReactFlowProvider>
            <ProcessMapper user={user} />
          </ReactFlowProvider>
        </main>
      </div>
    </SessionContextProvider>
  )
}
