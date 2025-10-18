import Dashboard from '../components/Dashboard'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
  }, [navigate])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [loading, user, navigate])
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <Dashboard
        user={user}
        userProfile={null}
        personalFinances={null}
        businessFinances={null}
        onStartNewAnalysis={() => { navigate('/analysis') }}
        onGenerateReport={() => { navigate('/reports') }}
        onConnectCRM={() => { navigate('/crm') }}
        onTaxCalendar={() => { navigate('/tax-calendar') }}
        onBudgeting={() => { navigate('/budget') }}
        onInvestments={() => { navigate('/investments') }}
      />
    </div>
  )
}



