import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthWrapper from './components/AuthWrapper'
import UserProfileSetup from './components/UserProfileSetup'
import TaxScenarioSelector from './components/TaxScenarioSelector'
import PersonalFinanceForm from './components/PersonalFinanceForm'
import BusinessFinanceForm from './components/BusinessFinanceForm'
import ComprehensiveAnalysisReport from './components/ComprehensiveAnalysisReport'
import Dashboard from './components/Dashboard'

export interface UserProfile {
  id: string
  email: string
  country: string
  filing_status: string
  birth_date: string
  dependents: number
  spouse_income: number
  tax_scenarios: string[]
  created_at: string
  updated_at: string
}

export interface PersonalFinances {
  id: string
  user_id: string
  annual_income: number
  deductions: number
  credits: number
  other_income: number
  created_at: string
  updated_at: string
}

export interface BusinessFinances {
  id: string
  user_id: string
  business_name: string
  business_type: string
  annual_revenue: number
  business_expenses: number
  created_at: string
  updated_at: string
}

type Step = 'auth' | 'profile' | 'scenario' | 'personal' | 'business' | 'analysis' | 'dashboard'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>('auth')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [personalFinances, setPersonalFinances] = useState<PersonalFinances | null>(null)
  const [businessFinances, setBusinessFinances] = useState<BusinessFinances | null>(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await checkUserProfile(session.user.id)
        } else {
          setCurrentStep('auth')
          setUserProfile(null)
          setPersonalFinances(null)
          setBusinessFinances(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setCurrentStep('profile')
        return
      }

      if (profile) {
        setUserProfile(profile)
        
        // Check if user has completed all steps
        if (profile.tax_scenarios && profile.tax_scenarios.length > 0) {
          // Check for personal finances
          const { data: personalData } = await supabase
            .from('personal_finances')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (personalData) {
            setPersonalFinances(personalData)
          }

          // Check for business finances if needed
          if (profile.tax_scenarios.includes('business') || profile.tax_scenarios.includes('combined')) {
            const { data: businessData } = await supabase
              .from('business_finances')
              .select('*')
              .eq('user_id', userId)
              .single()

            if (businessData) {
              setBusinessFinances(businessData)
            }
          }

          setCurrentStep('dashboard')
        } else {
          setCurrentStep('scenario')
        }
      } else {
        setCurrentStep('profile')
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      setCurrentStep('profile')
    }
  }

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    setCurrentStep('scenario')
  }

  const handleScenarioComplete = () => {
    setCurrentStep('personal')
  }

  const handlePersonalComplete = (finances: PersonalFinances) => {
    setPersonalFinances(finances)
    if (userProfile?.tax_scenarios?.includes('business') || userProfile?.tax_scenarios?.includes('combined')) {
      setCurrentStep('business')
    } else {
      setCurrentStep('analysis')
    }
  }

  const handleBusinessComplete = (finances: BusinessFinances) => {
    setBusinessFinances(finances)
    setCurrentStep('analysis')
  }

  const handleAnalysisComplete = () => {
    setCurrentStep('dashboard')
  }

  const handleBackToDashboard = () => {
    setCurrentStep('dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Zin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'auth' && (
        <AuthWrapper onAuthSuccess={() => checkUserProfile(user?.id)} />
      )}
      
      {currentStep === 'profile' && user && (
        <UserProfileSetup 
          user={user} 
          onComplete={handleProfileComplete}
        />
      )}
      
      {currentStep === 'scenario' && userProfile && (
        <TaxScenarioSelector 
          userProfile={userProfile}
          onComplete={handleScenarioComplete}
        />
      )}
      
      {currentStep === 'personal' && userProfile && (
        <PersonalFinanceForm 
          userProfile={userProfile}
          onComplete={handlePersonalComplete}
        />
      )}
      
      {currentStep === 'business' && userProfile && (
        <BusinessFinanceForm 
          userProfile={userProfile}
          onComplete={handleBusinessComplete}
        />
      )}
      
      {currentStep === 'analysis' && userProfile && personalFinances && (
        <ComprehensiveAnalysisReport 
          user={user}
          userProfile={userProfile}
          personalFinances={personalFinances}
          businessFinances={businessFinances}
          onComplete={handleAnalysisComplete}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
      
      {currentStep === 'dashboard' && userProfile && (
        <Dashboard 
          user={user}
          userProfile={userProfile}
          personalFinances={personalFinances}
          businessFinances={businessFinances}
          onStartNewAnalysis={() => setCurrentStep('analysis')}
        />
      )}
    </div>
  )
}

export default App
