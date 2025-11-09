import { } from 'react'
import { BarChart3, Calendar, TrendingUp, DollarSign, Building2, Users, Calculator, Upload, Building, BarChart } from 'lucide-react'

interface DashboardProps {
  user: any
  userProfile: any
  personalFinances: any
  businessFinances?: any
  onStartNewAnalysis: () => void
  onUploadDocuments?: () => void
  onTaxOptimization?: () => void
  onConnectCRM?: () => void
  onGenerateReport?: () => void
  onTaxCalendar?: () => void
}

export default function Dashboard({ 
  userProfile, 
  personalFinances, 
  businessFinances, 
  onStartNewAnalysis,
  onUploadDocuments,
  onTaxOptimization: _onTaxOptimization,
  onConnectCRM,
  onGenerateReport,
  onTaxCalendar
}: DashboardProps) {
  const personalTaxableIncome = personalFinances 
    ? personalFinances.annual_income + personalFinances.other_income - personalFinances.deductions
    : 0

  const businessNetIncome = businessFinances 
    ? businessFinances.annual_revenue - businessFinances.business_expenses 
    : 0

  const totalTaxableIncome = personalTaxableIncome + businessNetIncome

  const quickActions = [
    {
      title: 'Upload Documents',
      description: 'Upload your financial documents for analysis',
      icon: Upload,
      action: onUploadDocuments ?? (() => { console.log('Navigate to upload') }),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Connect CRM',
      description: 'Connect your CRM system for automatic data sync',
      icon: Building,
      action: onConnectCRM ?? (() => { console.log('Navigate to CRM') }),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Generate Report',
      description: 'Generate your personalized tax analysis report',
      icon: BarChart,
      action: onGenerateReport ?? (() => { console.log('Navigate to report generation') }),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Tax Calendar',
      description: 'View important tax dates and deadlines',
      icon: Calendar,
      action: onTaxCalendar ?? (() => { console.log('Navigate to calendar') }),
      color: 'bg-orange-500 hover:bg-orange-600'
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-[#1E90FF] rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Taxify Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userProfile?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onStartNewAnalysis}
                className="btn btn-primary flex items-center"
              >
                <Calculator className="h-4 w-4 mr-2" />
                New Analysis
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 py-8">
        {/* Financial Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-md rounded-2xl border border-blue-100/50">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-[#1E90FF]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Total Taxable Income</dt>
                    <dd className="text-lg font-semibold text-gray-900">${totalTaxableIncome.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-md rounded-2xl border border-blue-100/50">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-[#1E90FF]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Personal Income</dt>
                    <dd className="text-lg font-semibold text-gray-900">${personalTaxableIncome.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {businessFinances && (
            <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-md rounded-2xl border border-blue-100/50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-[#1E90FF]" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600 truncate">Business Income</dt>
                      <dd className="text-lg font-semibold text-gray-900">${businessNetIncome.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-md rounded-2xl border border-blue-100/50">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-[#1E90FF]" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Tax Scenarios</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {userProfile?.tax_scenarios?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50">
            <div className="px-6 py-4 border-b border-blue-100/50">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="btn btn-primary p-4 text-left transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <Icon className="h-6 w-6 mr-3" />
                        <div>
                          <h3 className="font-semibold">{action.title}</h3>
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
          <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50">
            <div className="px-6 py-4 border-b border-blue-100/50">
              <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 bg-[#E0F0FF]/50 rounded-2xl border border-blue-100/50">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{analysis.title}</h3>
                      <p className="text-sm text-gray-600">{analysis.type} • {analysis.date}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {analysis.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50">
          <div className="px-6 py-4 border-b border-blue-100/50">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tax Deadlines</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-blue-100/50 rounded-2xl bg-white/50">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-[#1E90FF] mr-3" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{deadline.title}</h3>
                      <p className="text-sm text-gray-600">{deadline.type} • {deadline.date}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
        <div className="mt-8 bg-gradient-to-r from-[#E0F0FF] to-[#D1E9FF] shadow-md rounded-2xl border border-blue-100/50">
          <div className="px-6 py-4 border-b border-blue-200/50">
            <h2 className="text-lg font-semibold text-gray-900">Tax Tips for You</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-[#1E90FF] mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Maximize Your Deductions</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Consider itemizing your deductions if they exceed the standard deduction for your filing status.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-[#1E90FF] mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Contribute to Retirement Accounts</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Maximize contributions to 401(k) and IRA accounts to reduce your taxable income.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-[#1E90FF] mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Plan for Next Year</h3>
                  <p className="text-sm text-gray-700 mt-1">
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
