import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fdf9f6] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
        <p className="mb-4">The page you are looking for does not exist.</p>
        <Link to="/" className="text-blue-600 underline">Go Home</Link>
      </div>
    </div>
  )
}