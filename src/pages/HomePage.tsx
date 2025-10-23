import LandingPage from '../components/LandingPage'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <LandingPage onGetStarted={() => { navigate('/onboarding') }} />
    </div>
  )
}



