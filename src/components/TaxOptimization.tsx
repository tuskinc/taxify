import { useState, useEffect } from 'react'
import { Target, TrendingUp, DollarSign, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface TaxOptimizationProps {
  user: any
  userProfile: any
  personalFinances: any
  businessFinances?: any
  onBack: () => void
}

interface OptimizationResult {
  current_tax: number
  optimized_tax: number
  potential_savings: number
  recommendations: string[]
  confidence_score: number
  chart_data: any
}

export default function TaxOptimization({ 
  user, 
  userProfile, 
  personalFinances, 
  businessFinances: _businessFinances, 
  onBack 
}: TaxOptimizationProps) {
  const [loading, setLoading] = useState(false)
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && userProfile && personalFinances) {
      runOptimization()
    }
  }, [user, userProfile, personalFinances])

  const runOptimization = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Call the Supabase Edge Function for tax optimization
      const { data, error } = await supabase.functions.invoke('optimize-tax', {
        body: {
          user_id: user.id
        }
      })

      if (error) {
        throw error
      }

      if (data && data.success) {
        setOptimization(data.result)
      } else {
        throw new Error(data?.error || 'Optimization failed')
      }
    } catch (err) {
      console.error('Tax optimization error:', err)
      setError('Failed to run tax optimization. Please try again.')
      
      // Fallback: show mock data for demonstration
      setOptimization({
        current_tax: 25000,
        optimized_tax: 22000,
        potential_savings: 3000,
        recommendations: [
          'Maximize retirement contributions to reduce taxable income',
          'Consider itemizing deductions if they exceed standard deduction',
          'Explore tax-loss harvesting opportunities',
          'Review business expense deductions'
        ],
        confidence_score: 0.85,
        chart_data: {
          current_breakdown: {
            federal: 18000,
            state: 5000,
            local: 2000
          },
          optimized_breakdown: {
            federal: 16000,
            state: 4500,
            local: 1500
          }
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (!optimization) return
    
    const reportContent = `
Tax Optimization Report
Generated: ${new Date().toLocaleDateString()}

Current Tax Liability: $${optimization.current_tax.toLocaleString()}
Optimized Tax Liability: $${optimization.optimized_tax.toLocaleString()}
Potential Savings: $${optimization.potential_savings.toLocaleString()}

Recommendations:
${optimization.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Confidence Score: ${(optimization.confidence_score * 100).toFixed(0)}%
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Tax_Optimization_Report_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="page-container">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Tax Optimization</h1>
                <p className="text-sm text-gray-600">AI-powered tax savings analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing your tax situation...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Optimization Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {optimization && (
          <>
            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Current Tax</h3>
                      <p className="text-2xl font-bold text-red-600">
                        ${optimization.current_tax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Optimized Tax</h3>
                      <p className="text-2xl font-bold text-green-600">
                        ${optimization.optimized_tax.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Potential Savings</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${optimization.potential_savings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI Recommendations</h2>
                <p className="text-sm text-gray-600">
                  Confidence: {(optimization.confidence_score * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {optimization.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDownloadReport}
                className="btn btn-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </button>
              <button
                onClick={runOptimization}
                className="btn btn-secondary"
              >
                <Target className="h-4 w-4 mr-2" />
                Re-optimize
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
