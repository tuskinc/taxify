import Dashboard from '../components/Dashboard'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])  }, [])        const { data: { session } } = await supabase.auth.getSession()
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])  }, [])
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <Dashboard user={user} userProfile={null} personalFinances={null} businessFinances={null} onStartNewAnalysis={() => { window.location.href = '/analysis' }} onUploadDocuments={() => { window.location.href = '/upload' }} onGenerateReport={() => { window.location.href = '/reports' }} />
    </div>
  )
}



