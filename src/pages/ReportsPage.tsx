import ReportPage from '../components/ReportPage'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface UserProfile {
  filing_status: string
  dependents: number
  // add other profile fields
}

interface PersonalFinances {
  annual_income: number
  other_income: number
  deductions: number
  // add other personal finance fields
}

interface BusinessFinances {
  annual_revenue: number
  business_expenses: number
  // add other business finance fields
}

export default function ReportsPage() {
  const [state, setState] = useState<{ userProfile: UserProfile, personalFinances: PersonalFinances, businessFinances: BusinessFinances | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get user with error checking
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) {
          throw new Error(`Authentication error: ${authError.message}`)
        }
        
        if (!user) { 
          void navigate('/login', { replace: true })
          return 
        }
        
        // Get user profile with error checking
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        if (profileError) {
          throw new Error(`Profile fetch error: ${profileError.message}`)
        }
        
        // Get personal finances with error checking
        const { data: personal, error: personalError } = await supabase
          .from('personal_finances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (personalError) {
          throw new Error(`Personal finances fetch error: ${personalError.message}`)
        }
        
        // Get business finances with error checking
        const { data: business, error: businessError } = await supabase
          .from('business_finances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (businessError) {
          throw new Error(`Business finances fetch error: ${businessError.message}`)
        }
        
        if (isMounted) {
          if (profile && personal) {
            // Transform data to match ReportPage component expectations
            const transformedUserProfile: UserProfile = {
              filing_status: profile.filing_status ?? 'single',
              dependents: profile.dependents ?? 0
            }
            
            const transformedPersonalFinances: PersonalFinances = {
              annual_income: personal.annual_income ?? 0,
              other_income: personal.other_income ?? 0,
              deductions: personal.deductions ?? 0
            }
            
            const transformedBusinessFinances: BusinessFinances | null = business ? {
              annual_revenue: business.annual_revenue ?? 0,
              business_expenses: business.business_expenses ?? 0
            } : null
            
            setState({ 
              userProfile: transformedUserProfile, 
              personalFinances: transformedPersonalFinances, 
              businessFinances: transformedBusinessFinances 
            })
            setLoading(false)
          } else {
            setError('Required data not found')
            setLoading(false)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred')
          setLoading(false)
        }
      }
    }
    void init()
    return () => { isMounted = false }
  }, [navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => { window.location.reload() }} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  if (!state) {
    void navigate('/dashboard', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <ReportPage userProfile={state.userProfile} personalFinances={state.personalFinances} businessFinances={state.businessFinances} onBackToDashboard={() => { void navigate('/dashboard') }} />
    </div>
  )
}



