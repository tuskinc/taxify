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
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage, LoginPage, SignUpPage, OnboardingPage, DashboardPage, TaxScenariosPage, ReportsPage, ProfilePage, PaymentPage, SupportPage, NotFoundPage, BudgetingPage, InvestmentsPage, TaxSummaryPage } from './pages'

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
  const [fetchError, setFetchError] = useState<string | null>(null)

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
          // Optimistic navigation to prevent UI stall; profile check will refine the step
          setCurrentStep((prev) => (prev === 'landing' || prev === 'onboarding' || prev === 'auth' ? 'dashboard' : prev))
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
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          // Optimistic navigation to avoid being stuck on auth screen
          setCurrentStep((prev) => (prev === 'landing' || prev === 'onboarding' || prev === 'auth' ? 'dashboard' : prev))
          console.log('✅ User authenticated, checking profile...')
          await checkUserProfile(session.user.id)
        } else {
          console.log('❌ No user session, resetting to landing')
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
      console.log('🔍 Checking user profile for:', userId)
      // reset any previous fetch error before attempting a fresh load
      setFetchError(null)
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error fetching profile:', error)
        throw error
      }

      console.log('📊 Profile data:', profile)
      console.log('🔍 Profile exists:', !!profile)

      if (profile) {
        console.log('✅ Profile found, normalizing data...')
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
        console.log('✅ Normalized profile:', normalizedProfile)
        setUserProfile(normalizedProfile)
        
        // Check if user has completed all steps
        if (normalizedProfile.tax_scenarios && Array.isArray(normalizedProfile.tax_scenarios) && normalizedProfile.tax_scenarios.length > 0) {
          console.log('💰 User has tax scenarios, checking finances...')
          console.log('📋 Tax scenarios:', normalizedProfile.tax_scenarios)
          // Check for personal finances
          const { data: personalData, error: personalError } = await supabase
            .from('personal_finances')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

          if (personalError) {
            console.error('❌ Error fetching personal finances:', personalError)
            setFetchError('We couldn’t load your personal finances right now. Please try again. If the issue persists, contact support.')
          } else if (personalData) {
            console.log('✅ Personal finances found:', personalData)
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
            console.log('Checking business finances...')
            const { data: businessData, error: businessError } = await supabase
              .from('business_finances')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()

            if (businessError) {
              console.error('Error fetching business finances:', businessError)
              setFetchError('We couldn’t load your business finances right now. Please try again. If the issue persists, contact support.')
            } else if (businessData) {
              console.log('Business finances found:', businessData)
              setBusinessFinances({
                ...businessData,
                annual_revenue: businessData.annual_revenue ?? 0,
                business_expenses: businessData.business_expenses ?? 0,
              } as BusinessFinances)
            }
          }

          console.log('🎯 Setting current step to dashboard')
          setCurrentStep('dashboard')
        } else {
          console.log('📋 No tax scenarios, going to scenario selection')
          setCurrentStep('scenario')
        }
      } else {
        console.log('👤 No profile found, going to profile setup')
        // No profile row yet → collect profile
        setCurrentStep('profile')
      }
    } catch (error) {
      console.error('❌ Error checking user profile:', error)
      setFetchError('We couldn’t load your account data. Please try again. If this continues, contact support.')
      setCurrentStep('profile')
    }
  }

  const handleRetryFetch = async () => {
    if (!user?.id) return
    setFetchError(null)
    await checkUserProfile(user.id)
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
    <BrowserRouter>
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
        <>
          {fetchError && (
            <div className="mx-4 mt-4 mb-2 p-3 rounded border border-red-200 bg-red-50 text-red-800">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-5">{fetchError}</p>
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetryFetch}
                    className="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}
        <Dashboard 
          user={user}
          userProfile={userProfile}
          personalFinances={personalFinances}
          businessFinances={businessFinances}
          onStartNewAnalysis={() => { setCurrentStep('analysis') }}
          onUploadDocuments={handleNavigateToUpload}
          onGenerateReport={handleNavigateToReport}
        />
        </>
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

        {/* Router-based navigation */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budget" element={<BudgetingPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/tax-summary" element={<TaxSummaryPage />} />
          <Route path="/scenarios" element={<TaxScenariosPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App