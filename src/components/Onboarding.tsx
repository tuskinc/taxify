import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react'

interface OnboardingProps {
  onAuthSuccess: () => void
}

interface ErrorLike {
  message: string
}

export default function Onboarding({ onAuthSuccess }: OnboardingProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [skipCRM, setSkipCRM] = useState(false)

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onAuthSuccess()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      }
    } catch (err: unknown) {
      const e = err as Partial<ErrorLike>
      setError(typeof e.message === 'string' ? e.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setMessage('Password reset email sent!')
    } catch (err: unknown) {
      const e = err as Partial<ErrorLike>
      setError(typeof e.message === 'string' ? e.message : 'An unexpected error occurred')
    }
  }

  const handleSkipToDashboard = () => {
    // Only allow skipping in development
    if (process.env.NODE_ENV === 'development') {
      onAuthSuccess()
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Taxify
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => { void handleAuth(e) }}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setName(e.target.value) }}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 min-h-[36px] border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 min-h-[36px] border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 min-h-[36px] border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => { setShowPassword(!showPassword) }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setConfirmPassword(e.target.value) }}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 min-h-[36px] border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>

            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <input
                  id="skip-crm"
                  name="skip-crm"
                  type="checkbox"
                  checked={skipCRM}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSkipCRM(e.target.checked) }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="skip-crm" className="ml-2 block text-sm text-gray-900">
                  Connect CRM later
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { handleSkipToDashboard() }}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Skip for now - Explore Dashboard
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin) }}
              className="text-sm text-[#1877f2] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={() => { void handlePasswordReset() }}
                className="text-sm text-[#1877f2] hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
