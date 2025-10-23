import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/Profile'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { if (isMounted) setLoading(false); return }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle<Profile>()
      if (!isMounted) return
      setProfile(data ?? null)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center">No profile</div>

  return (
    <div className="min-h-screen bg-[#fdf9f6] p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-2">
        <div><span className="font-semibold">ID:</span> {profile.id}</div>
        {profile.email && (
          <div><span className="font-semibold">Email:</span> {profile.email}</div>
        )}
      </div>
      <pre className="bg-white p-4 rounded shadow overflow-auto mt-4">{JSON.stringify(profile, null, 2)}</pre>
    </div>
  )
}


