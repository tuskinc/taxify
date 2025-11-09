import { useState } from 'react'
import { supabase } from '../lib/supabase'
import LoginPage from './LoginPage'

interface AuthWrapperProps {
  onAuthSuccess: () => void
}

export default function AuthWrapper({ onAuthSuccess }: AuthWrapperProps) {
  const [loading, setLoading] = useState(false)
  const [, setError] = useState('')

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError('')

    try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    onAuthSuccess()
  }

  return (
    <LoginPage 
      onLogin={handleLogin}
      onSkip={handleSkip}
      loading={loading}
    />
  )
}