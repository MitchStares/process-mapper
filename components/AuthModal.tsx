"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from '@supabase/supabase-js'
import toast, { Toaster } from 'react-hot-toast'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Github } from 'lucide-react'

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

interface AuthModalProps {
  user: User | null
  setUser: (user: User | null) => void
}

export default function AuthModal({ user, setUser }: AuthModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const supabase = useSupabaseClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })
        if (error) throw error
        setUser(data.user)
        toast.success('Signed in successfully')
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        })
        if (error) throw error
        toast.success('Check your email for the confirmation link!')
      }
      setIsOpen(false)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      setUser(null)
      toast.success('Signed out successfully')
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {user ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut} 
              className="fixed top-4 right-4 z-50 "
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="fixed top-4 right-4 z-50"
            >
              Sign In
            </Button>
          )}
        </DialogTrigger>
        {!user && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</DialogTitle>
              <DialogDescription>
                {authMode === 'signin'
                  ? 'Enter your credentials to access your account.'
                  : 'Create an account to get started.'}
              </DialogDescription>
            </DialogHeader>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Loading...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4">
                  <Button onClick={handleGitHubSignIn} className="w-full" variant="outline">
                    <Github className="mr-2 h-4 w-4" />
                    Sign in with GitHub
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="signup">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Loading...' : 'Sign Up'}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4">
                  <Button onClick={handleGitHubSignIn} className="w-full" variant="outline">
                    <Github className="mr-2 h-4 w-4" />
                    Sign up with GitHub
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
