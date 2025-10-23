import Onboarding from '../components/Onboarding'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <Onboarding onAuthSuccess={() => { window.location.href = '/dashboard' }} />
    </div>
  )
}



