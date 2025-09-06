import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './components/Dashboard';
import UserProfileSetup from './components/UserProfileSetup';
import TaxScenarioSelector from './components/TaxScenarioSelector';
import PersonalFinanceForm from './components/PersonalFinanceForm';
import BusinessFinanceForm from './components/BusinessFinanceForm';
import ComprehensiveAnalysisReport from './components/ComprehensiveAnalysisReport';
import { User } from '@supabase/supabase-js';

export type TaxScenario = 'personal' | 'business' | 'combined';

export interface UserProfile {
  id: string;
  user_id: string;
  birth_date: string | null;
  dependents: number;
  spouse_income: number;
  filing_status: string;
  updated_at: string;
}

export interface PersonalFinances {
  id: string;
  user_id: string;
  salary_income: number;
  freelance_income: number;
  investment_income: number;
  rental_income: number;
  capital_gains: number;
  retirement_contributions: number;
  mortgage_interest: number;
  property_taxes: number;
  charitable_donations: number;
  medical_expenses: number;
  childcare_costs: number;
  education_expenses: number;
  other_deductions: number;
  created_at: string;
}

export interface BusinessFinances {
  id: string;
  business_id: string;
  revenue: number;
  employee_costs: number;
  equipment: number;
  rent: number;
  utilities: number;
  marketing: number;
  travel_expenses: number;
  office_supplies: number;
  professional_services: number;
  insurance: number;
  other_expenses: number;
  created_at: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentStep, setCurrentStep] = useState<'profile' | 'scenario' | 'personal' | 'business' | 'analysis'>('profile');
  const [selectedScenario, setSelectedScenario] = useState<TaxScenario>('personal');
  const [personalData, setPersonalData] = useState<Partial<PersonalFinances> | null>(null);
  const [businessData, setBusinessData] = useState<Partial<BusinessFinances> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUserProfile(data);
        setCurrentStep('scenario');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentStep('scenario');
  };

  const handleScenarioSelect = (scenario: TaxScenario) => {
    setSelectedScenario(scenario);
    if (scenario === 'personal' || scenario === 'combined') {
      setCurrentStep('personal');
    } else {
      setCurrentStep('business');
    }
  };

  const handlePersonalDataComplete = (data: Partial<PersonalFinances>) => {
    setPersonalData(data);
    if (selectedScenario === 'combined') {
      setCurrentStep('business');
    } else {
      setCurrentStep('analysis');
    }
  };

  const handleBusinessDataComplete = (data: Partial<BusinessFinances>) => {
    setBusinessData(data);
    setCurrentStep('analysis');
  };

  const resetToProfile = () => {
    setCurrentStep('profile');
    setSelectedScenario('personal');
    setPersonalData(null);
    setBusinessData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Tax Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Taxify</h1>
              <span className="ml-2 text-sm text-gray-500">Tax Analysis Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['profile', 'scenario', 'personal', 'business', 'analysis'].map((step, index) => {
              const isActive = currentStep === step;
              const isCompleted = ['profile', 'scenario', 'personal', 'business', 'analysis'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-primary-600 text-white' : 
                    isCompleted ? 'bg-success-600 text-white' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-primary-600' : 
                    isCompleted ? 'text-success-600' : 
                    'text-gray-500'
                  }`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 4 && (
                    <div className={`ml-4 w-16 h-0.5 ${
                      isCompleted ? 'bg-success-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'profile' && (
          <UserProfileSetup onComplete={handleProfileComplete} />
        )}

        {currentStep === 'scenario' && (
          <TaxScenarioSelector onSelect={handleScenarioSelect} />
        )}

        {currentStep === 'personal' && (
          <PersonalFinanceForm 
            onComplete={handlePersonalDataComplete}
            onBack={() => setCurrentStep('scenario')}
          />
        )}

        {currentStep === 'business' && (
          <BusinessFinanceForm 
            onComplete={handleBusinessDataComplete}
            onBack={() => setCurrentStep('personal')}
          />
        )}

        {currentStep === 'analysis' && (
          <ComprehensiveAnalysisReport
            scenario={selectedScenario}
            personalData={personalData}
            businessData={businessData}
            onReset={resetToProfile}
          />
        )}
      </main>
    </div>
  );
}

export default App;
