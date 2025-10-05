import ReportPage from '../components/ReportPage'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ReportsPage() {
  const [state, setState] = useState<{ userProfile: any, personalFinances: any, businessFinances: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login', { replace: true }); return }
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
      const { data: personal } = await supabase.from('personal_finances').select('*').eq('user_id', user.id).maybeSingle()
      const { data: business } = await supabase.from('business_finances').select('*').eq('user_id', user.id).maybeSingle()
      if (isMounted) setState({ userProfile: profile, personalFinances: personal, businessFinances: business })
      if (isMounted) setLoading(false)
    }
    void init()
    return () => { isMounted = false }
  }, [navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!state?.userProfile || !state?.personalFinances) {
    navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <ReportPage userProfile={state.userProfile} personalFinances={state.personalFinances} businessFinances={state.businessFinances} onBackToDashboard={() => { navigate('/dashboard') }} />
    </div>
  )
}



