import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AuthWrapper from './components/AuthWrapper'
import UserProfileSetup from './components/UserProfileSetup'
import TaxScenarioSelector from './components/TaxScenarioSelector'
import PersonalFinanceForm from './components/PersonalFinanceForm'
import BusinessFinanceForm from './components/BusinessFinanceForm'
import ComprehensiveAnalysisReport from './components/ComprehensiveAnalysisReport'
import Dashboard from './components/Dashboard'
import DocumentUploadPage from './components/DocumentUploadPage'
import ReportPage from './components/ReportPage'
import Onboarding from './components/Onboarding'
import LandingPage from './components/LandingPage'

export interface UserProfile {
  id: string
  email: string
  country: string
  filing_status: string
  birth_date: string
  dependents: number
  spouse_income: number
  tax_scenarios: TaxScenario[]
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

export type TaxScenarioId = 'personal' | 'business' | 'combined'

export interface TaxScenario {
  id: TaxScenarioId
  name: string
  description: string
}

const SCENARIOS: Record<TaxScenarioId, TaxScenario> = {
  personal: {
    id: 'personal',
    name: 'Personal & Family Taxes',
    description: 'Analyze personal income, deductions, and family tax situation',
  },
  business: {
    id: 'business',
    name: 'Business Taxes',
    description: 'Optimize business tax strategy and compliance',
  },
  combined: {
    id: 'combined',
    name: 'Combined Analysis',
    description: 'Comprehensive analysis of both personal and business finances',
  },
}

type Step = 'landing' | 'onboarding' | 'auth' | 'profile' | 'scenario' | 'personal' | 'business' | 'analysis' | 'dashboard' | 'upload' | 'document_upload' | 'report'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>('landing')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [personalFinances, setPersonalFinances] = useState<PersonalFinances | null>(null)
  const [businessFinances, setBusinessFinances] = useState<BusinessFinances | null>(null)

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
        if (session?.user) {
          await checkUserProfile(session.user.id)
        }
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
      async (_event, session) => {
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await checkUserProfile(session.user.id)
        } else {
          setCurrentStep('landing')
          setUserProfile(null)
          setPersonalFinances(null)
          setBusinessFinances(null)
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

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      if (profile) {
        const p = profile as Record<string, unknown>
        const toStringOrEmpty = (v: unknown) => (typeof v === 'string' ? v : '')
        const toNumberOrZero = (v: unknown) => (typeof v === 'number' ? v : 0)
          const toScenarioArray = (v: unknown): TaxScenario[] => {
            if (Array.isArray(v)) {
              // Accept either array of ids or array of objects
              const result: TaxScenario[] = []
              for (const item of v) {
                if (typeof item === 'string') {
                  if (item in SCENARIOS) result.push(SCENARIOS[item as TaxScenarioId])
                } else if (item && typeof item === 'object' && 'id' in item) {
                  const obj = item as Partial<TaxScenario>
                  const id = typeof obj.id === 'string' ? (obj.id as TaxScenarioId) : undefined
                  if (id && (id in SCENARIOS)) {
                    // merge with canonical to ensure required fields
                    result.push({ ...SCENARIOS[id], ...obj })
                  }
                }
              }
              return result
            }
            return []
          }
        const normalizedProfile: UserProfile = {
          id: toStringOrEmpty(p.id),
          email: toStringOrEmpty(p.email),
          country: toStringOrEmpty(p.country) || 'US',
          filing_status: toStringOrEmpty(p.filing_status) || 'single',
          birth_date: toStringOrEmpty(p.birth_date),
          dependents: toNumberOrZero(p.dependents),
          spouse_income: toNumberOrZero(p.spouse_income),
          tax_scenarios: toScenarioArray(p.tax_scenarios),
          created_at: toStringOrEmpty(p.created_at) || new Date().toISOString(),
          updated_at: toStringOrEmpty(p.updated_at) || new Date().toISOString(),
        }
        setUserProfile(normalizedProfile)
        
        // Check if user has completed all steps
        if (normalizedProfile.tax_scenarios && Array.isArray(normalizedProfile.tax_scenarios) && normalizedProfile.tax_scenarios.length > 0) {
          // Check for personal finances
          const { data: personalData } = await supabase
            .from('personal_finances')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (personalData) {
            setPersonalFinances({
              ...personalData,
              annual_income: personalData.annual_income ?? 0,
              deductions: personalData.deductions ?? 0,
              credits: personalData.credits ?? 0,
              other_income: personalData.other_income ?? 0,
            } as PersonalFinances)
          }

          // Check for business finances if needed
          if (Array.isArray(normalizedProfile.tax_scenarios) && normalizedProfile.tax_scenarios.some((s) => s.id === 'business' || s.id === 'combined')) {
            const { data: businessData } = await supabase
              .from('business_finances')
              .select('*')
              .eq('user_id', userId)
              .single()

            if (businessData) {
              setBusinessFinances({
                ...businessData,
                annual_revenue: businessData.annual_revenue ?? 0,
                business_expenses: businessData.business_expenses ?? 0,
              } as BusinessFinances)
            }
          }

          setCurrentStep('dashboard')
        } else {
          setCurrentStep('scenario')
        }
      } else {
        // No profile row yet → collect profile
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
    if (userProfile && Array.isArray(userProfile.tax_scenarios) && userProfile.tax_scenarios.some(s => s.id === 'business' || s.id === 'combined')) {
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

  const handleNavigateToUpload = () => {
    setCurrentStep('document_upload')
  }

  const handleNavigateToReport = () => {
    setCurrentStep('report')
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
    <div className="min-h-screen bg-[#fdf9f6]">
      {currentStep === 'landing' && (
        <LandingPage onGetStarted={() => { setCurrentStep('onboarding') }} />
      )}
      {currentStep === 'onboarding' && (
        <Onboarding onAuthSuccess={() => {
          const handleAuthSuccess = async () => {
            const { data } = await supabase.auth.getUser()
            const uid = data.user?.id
            if (uid) {
              await checkUserProfile(uid)
            } else {
              // If still no user, go to dashboard anyway for demo
              setCurrentStep('dashboard')
              // Create a mock user profile for demo
              setUserProfile({
                id: 'demo-user',
                email: 'demo@taxify.com',
                country: 'US',
                filing_status: 'single',
                birth_date: '1990-01-01',
                dependents: 0,
                spouse_income: 0,
                tax_scenarios: [SCENARIOS.personal],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              setPersonalFinances({
                id: 'demo-personal',
                user_id: 'demo-user',
                annual_income: 75000,
                deductions: 12000,
                credits: 2000,
                other_income: 5000,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            }
          }
          void handleAuthSuccess()
        }} />
      )}
      {currentStep === 'auth' && (
        <AuthWrapper onAuthSuccess={() => {
          const handleAuthSuccess = async () => {
          const { data } = await supabase.auth.getUser()
          const uid = data.user?.id
          if (uid) {
            await checkUserProfile(uid)
          } else {
            // If still no user, stay on auth
            setCurrentStep('auth')
          }
          }
          void handleAuthSuccess()
        }} />
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
          onStartNewAnalysis={() => { setCurrentStep('analysis') }}
          onUploadDocuments={handleNavigateToUpload}
          onGenerateReport={handleNavigateToReport}
        />
      )}

      {currentStep === 'document_upload' && userProfile && (
        <DocumentUploadPage
          onUploadComplete={(data) => {
            console.log('Document upload completed:', data)
            setCurrentStep('dashboard')
          }}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {currentStep === 'report' && userProfile && personalFinances && (
        <ReportPage
          userProfile={userProfile}
          personalFinances={personalFinances}
          {...(businessFinances ? { businessFinances } : {})}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  )
}

export default App