import TaxScenarioSelector from '../components/TaxScenarioSelector'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function TaxScenariosPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError

        if (user) {
          const { data, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          if (dbError) throw dbError
          if (isMounted) setUserProfile(data)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Consider setting an error state to display to the user
      }
      if (isMounted) setLoading(false)
    }
    void init()
    return () => { isMounted = false }
  }, [])
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!userProfile) return <div className="min-h-screen flex items-center justify-center">No profile</div>

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <TaxScenarioSelector userProfile={userProfile} onComplete={() => { window.location.href = '/personal' }} />
    </div>
  )
}



