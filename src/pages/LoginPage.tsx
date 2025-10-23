import AuthWrapper from '../components/AuthWrapper'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <AuthWrapper onAuthSuccess={() => { window.location.href = '/dashboard' }} />
    </div>
  )
}



