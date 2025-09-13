import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { User, Building2, Users, AlertCircle } from 'lucide-react'

interface TaxScenarioSelectorProps {
  userProfile: any
  onComplete: () => void
}

export default function TaxScenarioSelector({ userProfile, onComplete }: TaxScenarioSelectorProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const scenarios = [
    {
      id: 'personal',
      title: 'Personal & Family Taxes',
      description: 'Analyze your personal income, deductions, and family tax situation',
      icon: Users,
      features: [
        'Personal income analysis',
        'Family tax optimization',
        'Deduction recommendations',
        'Tax credit opportunities'
      ]
    },
    {
      id: 'business',
      title: 'Business Taxes',
      description: 'Optimize your business tax strategy and compliance',
      icon: Building2,
      features: [
        'Business income analysis',
        'Expense optimization',
        'Depreciation strategies',
        'Quarterly tax planning'
      ]
    },
    {
      id: 'combined',
      title: 'Combined Analysis',
      description: 'Comprehensive analysis of both personal and business finances',
      icon: User,
      features: [
        'Integrated tax strategy',
        'Cross-entity optimization',
        'Comprehensive planning',
        'Advanced tax strategies'
      ]
    }
  ]

  const handleScenarioToggle = (scenarioId: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId)
      } else {
        return [...prev, scenarioId]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedScenarios.length === 0) {
      setError('Please select at least one tax scenario')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('users')
        .update({ tax_scenarios: selectedScenarios })
        .eq('id', userProfile.id)

      if (error) throw error

      onComplete()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Choose Your Tax Analysis
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select the type of tax analysis you'd like to perform
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon
            const isSelected = selectedScenarios.includes(scenario.id)
            
            return (
              <div
                key={scenario.id}
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                onClick={() => handleScenarioToggle(scenario.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {scenario.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <ul className="space-y-2">
                    {scenario.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={loading || selectedScenarios.length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : null}
            Continue to Financial Details
          </button>
        </div>
      </div>
    </div>
  )
}
