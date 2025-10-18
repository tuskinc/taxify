import { BarChart3, Calendar, TrendingUp, DollarSign, Building2, Users, Calculator, Play } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

type TaxScenarioId = 'personal' | 'business' | 'combined'
interface TaxScenario { id: TaxScenarioId; name: string; description: string }

interface PersonalFinance {
  annual_income?: number
  other_income?: number
  deductions?: number
  credits?: number
}

interface BusinessFinance {
  annual_revenue?: number
  business_expenses?: number
}

interface UserProfile {
  id?: string
  email?: string
  country?: string
  filing_status?: string
  birth_date?: string
  dependents?: number
  spouse_income?: number
  tax_scenarios?: TaxScenario[]
}

interface DashboardProps {
  user?: User | null
  userProfile?: UserProfile | null
  personalFinances?: PersonalFinance | null
  businessFinances?: BusinessFinance | null
  onStartNewAnalysis?: () => void
  onGenerateReport?: () => void
  onConnectCRM?: () => void
  onTaxCalendar?: () => void
  onBudgeting?: () => void
  onInvestments?: () => void
}

export default function Dashboard({ 
  userProfile, 
  personalFinances, 
  businessFinances, 
  onStartNewAnalysis,
  onGenerateReport,
  onConnectCRM,
  onTaxCalendar,
  onBudgeting,
  onInvestments
}: DashboardProps) {
  const personalTaxableIncome: number = (personalFinances?.annual_income ?? 0) + (personalFinances?.other_income ?? 0) - (personalFinances?.deductions ?? 0)

  const businessNetIncome: number = (businessFinances?.annual_revenue ?? 0) - (businessFinances?.business_expenses ?? 0)

  const totalTaxableIncome: number = personalTaxableIncome + businessNetIncome

  const quickActions = [
    {
      title: 'Connect CRM',
      description: 'Connect your CRM system for automatic data sync',
      icon: Building2,
      action: onConnectCRM ?? (() => { console.log('Navigate to CRM connection') }),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Generate Report',
      description: 'Generate your personalized tax analysis report',
      icon: BarChart3,
      action: onGenerateReport ?? (() => { /* no-op */ }),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Tax Calendar',
      description: 'View important tax dates and deadlines',
      icon: Calendar,
      action: onTaxCalendar ?? (() => { console.log('View calendar') }),
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Budgeting',
      description: 'Track income, expenses, and savings',
      icon: DollarSign,
      action: onBudgeting ?? (() => { console.log('Navigate to budgeting') }),
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: 'Investments',
      description: 'Manage your investment portfolio',
      icon: TrendingUp,
      action: onInvestments ?? (() => { console.log('Navigate to investments') }),
      color: 'bg-emerald-500 hover:bg-emerald-600'
    }
  ]

  const recentAnalyses = [
    {
      id: 1,
      title: '2024 Tax Analysis',
      date: '2024-01-15',
      type: 'Comprehensive',
      status: 'Completed'
    },
    {
      id: 2,
      title: 'Q4 2023 Review',
      date: '2023-12-20',
      type: 'Personal',
      status: 'Completed'
    }
  ]

  const upcomingDeadlines = [
    {
      title: 'Tax Filing Deadline',
      date: '2024-04-15',
      type: 'Federal',
      priority: 'High'
    },
    {
      title: 'Quarterly Estimated Tax',
      date: '2024-01-15',
      type: 'Federal',
      priority: 'Medium'
    },
    {
      title: 'State Tax Deadline',
      date: '2024-04-15',
      type: 'State',
      priority: 'High'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="page-container">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Taxify Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userProfile?.email ?? 'Guest'}</p>
              </div>
            </div>
            <div className="flex items-center btn-row space-x-3">
              <button
                onClick={onGenerateReport}
                className="btn btn-primary"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              {onStartNewAnalysis && (
                <button
                  onClick={onStartNewAnalysis}
                  className="btn btn-ghost"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start New Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-24px">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16px mb-32px">
          <div className="card overflow-hidden">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Taxable Income</dt>
                    <dd className="text-lg font-medium text-gray-900">${totalTaxableIncome.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Personal Income</dt>
                    <dd className="text-lg font-medium text-gray-900">${personalTaxableIncome.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {(businessFinances?.annual_revenue ?? 0) > 0 && (
            <div className="card overflow-hidden">
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Business Income</dt>
                      <dd className="text-lg font-medium text-gray-900">${businessNetIncome.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tax Scenarios</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {userProfile?.tax_scenarios?.length ?? 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-24px lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-16px sm:grid-cols-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} text-white p-4 rounded-lg text-left min-h-[36px]`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm opacity-90">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Analyses</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{analysis.title}</h3>
                      <p className="text-sm text-gray-500">{analysis.type} • {analysis.date}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {analysis.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-24px card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Tax Deadlines</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{deadline.title}</h3>
                      <p className="text-sm text-gray-500">{deadline.type} • {deadline.date}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    deadline.priority === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {deadline.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tax Tips */}
        <div className="mt-24px bg-gradient-to-r from-blue-50 to-indigo-50 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-blue-200">
            <h2 className="text-lg font-medium text-gray-900">Tax Tips for You</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maximize Your Deductions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Consider itemizing your deductions if they exceed the standard deduction for your filing status.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Contribute to Retirement Accounts</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Maximize contributions to 401(k) and IRA accounts to reduce your taxable income.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Plan for Next Year</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start planning your tax strategy for next year to maximize savings opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
