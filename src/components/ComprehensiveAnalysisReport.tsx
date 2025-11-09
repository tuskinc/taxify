import { useState } from 'react'
import { apiClient } from '../api/client'
import { Download, Printer, ArrowLeft, AlertCircle, CheckCircle, TrendingUp, Calculator, DollarSign } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface PersonalFinances {
  annual_income: number
  other_income: number
  deductions: number
  credits: number
}

interface BusinessFinances {
  business_name: string
  annual_revenue: number
  business_expenses: number
}

interface ComprehensiveAnalysisReportProps {
  user: SupabaseUser | null
  personalFinances: PersonalFinances
  businessFinances?: BusinessFinances | null
  onBackToDashboard: () => void
}

export default function ComprehensiveAnalysisReport({ 
  user, 
  personalFinances, 
  businessFinances, 
  onBackToDashboard 
}: ComprehensiveAnalysisReportProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const handleDownload = async () => {
    if (!user?.id) {
      setDownloadError('User information is missing')
      return
    }

    setDownloading(true)
    setDownloadError('')

    try {
      await apiClient.downloadReport(user.id)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download report'
      setDownloadError(errorMessage)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculate basic tax metrics
  const personalTaxableIncome = personalFinances.annual_income + personalFinances.other_income - personalFinances.deductions
  // const personalNetIncome = personalTaxableIncome - personalFinances.credits

  const businessNetIncome = businessFinances ? businessFinances.annual_revenue - businessFinances.business_expenses : 0
  const totalTaxableIncome = personalTaxableIncome + (businessFinances ? businessNetIncome : 0)

  // Enhanced tax calculations with before/after cuts
  const totalIncome = personalFinances.annual_income + personalFinances.other_income + (businessFinances ? businessFinances.annual_revenue : 0)
  const totalCredits = personalFinances.credits || 0
  
  // Tax calculation without any deductions or credits (worst case scenario)
  const taxBeforeCuts = totalIncome * 0.25 // Simplified 25% tax rate on gross income
  
  // Tax calculation after deductions but before credits
  const taxAfterDeductions = totalTaxableIncome * 0.25
  
  // Tax calculation after both deductions and credits
  const taxAfterCuts = Math.max(0, taxAfterDeductions - totalCredits)
  
  // Calculate savings from tax cuts
  const taxCutSavings = taxBeforeCuts - taxAfterCuts
  
  // Legacy calculations for backward compatibility
  const effectiveRate = totalTaxableIncome > 0 ? (taxAfterCuts / totalTaxableIncome) * 100 : 0

  const recommendations = [
    {
      category: 'Income Optimization',
      items: [
        'Consider maximizing your 401(k) contributions to reduce taxable income',
        'Look into Health Savings Account (HSA) contributions if eligible',
        'Consider tax-loss harvesting for investment accounts'
      ]
    },
    {
      category: 'Deduction Opportunities',
      items: [
        'Maximize itemized deductions if they exceed the standard deduction',
        'Consider charitable giving strategies for tax benefits',
        'Review home office deductions if applicable'
      ]
    },
    {
      category: 'Tax Credits',
      items: [
        'Verify eligibility for Earned Income Tax Credit (EITC)',
        'Check for education-related tax credits',
        'Review child tax credit opportunities'
      ]
    }
  ]

  if (businessFinances) {
    recommendations.push({
      category: 'Business Tax Strategies',
      items: [
        'Consider Section 179 deductions for business equipment',
        'Review business expense categorization for maximum deductions',
        'Explore retirement plan options for business owners'
      ]
    })
  }

  return (
    <div className="min-h-screen py-8 pl-4 pr-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50 mb-6">
          <div className="px-6 py-4 border-b border-blue-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-[#1E90FF] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tax Analysis Report</h1>
                  <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onBackToDashboard}
                  className="inline-flex items-center pl-3 pr-3 py-2 border border-blue-100/50 shadow-sm text-sm leading-4 font-medium rounded-2xl text-[#1E90FF] bg-[#E0F0FF] hover:bg-[#D1E9FF] focus:outline-none transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center pl-3 pr-3 py-2 border border-blue-100/50 shadow-sm text-sm leading-4 font-medium rounded-2xl text-[#1E90FF] bg-[#E0F0FF] hover:bg-[#D1E9FF] focus:outline-none transition-all duration-200"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center pl-3 pr-3 py-2.5 border border-transparent text-sm leading-4 font-medium rounded-2xl text-white bg-[#1E90FF] hover:bg-[#1C7ED6] focus:outline-none shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {downloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {downloadError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Download Error</h3>
                <p className="mt-1 text-sm text-red-700">{downloadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Executive Summary</h2>
          </div>
          <div className="px-6 py-4">
            {/* Tax Impact Display */}
            <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Your Tax Impact Analysis</h3>
              <div className="space-y-4">
                {/* Without tax cuts */}
                <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-red-800 font-medium">Without tax cuts, you would have paid:</span>
                    <span className="text-2xl font-bold text-red-900">${taxBeforeCuts.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* With tax cuts */}
                <div className="bg-[#E0F0FF] border-l-4 border-[#1E90FF] p-4 rounded-r-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">With tax cuts, you only paid:</span>
                    <span className="text-2xl font-bold text-blue-900">${taxAfterCuts.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Savings message */}
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-medium">🎉 You have earned $Z from your tax cuts this year!</span>
                    <span className="text-2xl font-bold text-green-900">${taxCutSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-[#E0F0FF] p-4 rounded-2xl">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Taxable Income</p>
                    <p className="text-2xl font-bold text-blue-900">${totalTaxableIncome.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl">
                <div className="flex items-center">
                  <Calculator className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Final Tax Owed</p>
                    <p className="text-2xl font-bold text-green-900">${taxAfterCuts.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Effective Tax Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{effectiveRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Financial Breakdown</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Personal Finances */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Personal Finances</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Income:</span>
                    <span className="font-medium">${personalFinances.annual_income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Other Income:</span>
                    <span className="font-medium">${personalFinances.other_income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductions:</span>
                    <span className="font-medium">-${personalFinances.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">-${personalFinances.credits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-900">Taxable Income:</span>
                    <span className="font-semibold">${personalTaxableIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Business Finances */}
              {businessFinances && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Business Finances</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Name:</span>
                      <span className="font-medium">{businessFinances.business_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Revenue:</span>
                      <span className="font-medium">${businessFinances.annual_revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Expenses:</span>
                      <span className="font-medium">-${businessFinances.business_expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Net Income:</span>
                      <span className="font-semibold">${businessNetIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tax Optimization Recommendations */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Tax Optimization Recommendations</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-6">
              {recommendations.map((category, index) => (
                <div key={index}>
                  <h3 className="text-md font-medium text-gray-900 mb-3">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/90 backdrop-blur-sm shadow-md rounded-2xl border border-blue-100/50 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Next Steps</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <strong>Review your tax documents</strong> - Gather all necessary tax forms and receipts
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <strong>Implement recommendations</strong> - Start with the highest-impact tax optimization strategies
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <strong>Consult with a tax professional</strong> - Consider professional advice for complex situations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mb-8">
          <p>This report is generated by Zin - Tax Analysis Platform</p>
          <p>For questions or support, please contact our team</p>
        </div>
      </div>
    </div>
  )
}
