// src/App.tsx

import { useState, useEffect } from 'react'
import type { ReactElement, ComponentType } from 'react'

// … other code …

const ProtectedRoute = ({
  component: Component
}: {
  component: ComponentType
}): ReactElement => {
  // existing implementation…
}
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
// Step-based components removed; routing uses page components only
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import BudgetingPage from './pages/BudgetingPage'
import InvestmentsPage from './pages/InvestmentsPage'
import TaxSummaryPage from './pages/TaxSummaryPage'
import TaxScenariosPage from './pages/TaxScenariosPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'
import PaymentPage from './pages/PaymentPage'
import SupportPage from './pages/SupportPage'
import UploadPage from './pages/UploadPage'
import CRMPage from './pages/CRMPage'
import TaxCalendarPage from './pages/TaxCalendarPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('App mounted')
    let isMounted = true
    // Check for existing session with a timeout fallback
    let settled = false
    const timeoutId = setTimeout(() => {
      if (!settled && isMounted) {
        console.warn('getSession exceeded 5000ms; continuing without session')
        setLoading(false)
      }
    }, 5000)

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        settled = true
        if (error) {
          console.error('Failed to get session', error)
        }
        if (!isMounted) return
        setUser(session?.user ?? null)
      } catch (error) {
        settled = true
        console.error('Failed to get session', error)
      } finally {
        if (isMounted) setLoading(false)
        clearTimeout(timeoutId)
      }
    }
    void initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event)
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (!session?.user) {
          console.log('❌ No user session')
        } else {
          console.log('✅ User authenticated')
        }
        setLoading(false)
      }
    )

    return () => { 
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  // Safety: never allow loading to persist forever
  useEffect(() => {
    if (!loading) return
    const id = setTimeout(() => {
      console.warn('Loading exceeded 6000ms; forcing UI render fallback')
      setLoading(false)
    }, 6000)
    return () => { clearTimeout(id) }
  }, [loading])
  // Private route guard
  const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }): ReactElement => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Taxify...</p>
          </div>
        </div>
      )
    }
    if (!user) return <Navigate to="/login" replace />
    return <Component />
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Taxify...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-[#fdf9f6]">
        <Routes>
        {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Private routes */}
        <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
        <Route path="/budget" element={<ProtectedRoute component={BudgetingPage} />} />
        <Route path="/investments" element={<ProtectedRoute component={InvestmentsPage} />} />
        <Route path="/tax-summary" element={<ProtectedRoute component={TaxSummaryPage} />} />
        <Route path="/scenarios" element={<ProtectedRoute component={TaxScenariosPage} />} />
        <Route path="/reports" element={<ProtectedRoute component={ReportsPage} />} />
        <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
        <Route path="/payment" element={<ProtectedRoute component={PaymentPage} />} />
        <Route path="/support" element={<ProtectedRoute component={SupportPage} />} />
        <Route path="/upload" element={<ProtectedRoute component={UploadPage} />} />
        <Route path="/crm" element={<ProtectedRoute component={CRMPage} />} />
        <Route path="/tax-calendar" element={<ProtectedRoute component={TaxCalendarPage} />} />

        {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App
