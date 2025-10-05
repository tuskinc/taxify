import Onboarding from '../components/Onboarding'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignUpPage() {
  const navigate = useNavigate()
  const handleAuthSuccess = useCallback(() => {
    navigate('/onboarding')
  }, [navigate])
  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <Onboarding onAuthSuccess={handleAuthSuccess} />
    </div>
  )
}



