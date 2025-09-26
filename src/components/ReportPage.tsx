import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, Mail, ArrowLeft, CheckCircle, DollarSign, TrendingUp, Calculator, AlertCircle } from 'lucide-react'


interface UserProfile {
  filing_status: string
  dependents: number
  // add other profile fields
}

interface PersonalFinances {
  annual_income: number
  other_income: number
  deductions: number
  // add other personal finance fields
}

interface BusinessFinances {
  annual_revenue: number
  business_expenses: number
  // add other business fields
}

interface ReportData {
  totalTaxableIncome: number
  estimatedTaxLiability: number
  taxSavings: number
  moneySaved: number
  personalIncome: number
  businessIncome: number
  filingStatus: string
  dependents: number
  generatedDate: string
  reportId: string
}

interface ReportPageProps {
  userProfile: UserProfile
  personalFinances: PersonalFinances
  businessFinances?: BusinessFinances | null
  onBackToDashboard: () => void
}

export default function ReportPage({ 
  userProfile, 
  personalFinances, 
  businessFinances, 
  onBackToDashboard 
}: ReportPageProps) {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  const generateReport = useCallback(() => {
    setLoading(true)
    try {
      // Calculate tax information
      const personalTaxableIncome = personalFinances.annual_income + personalFinances.other_income - personalFinances.deductions

      const businessNetIncome = (businessFinances?.annual_revenue ?? 0) - (businessFinances?.business_expenses ?? 0)

      const totalTaxableIncome = personalTaxableIncome + businessNetIncome

      // Simulate AI tax analysis
      const estimatedTaxLiability = totalTaxableIncome * 0.22 // Rough 22% tax rate
      const taxSavings = personalFinances.deductions * 0.22
      const moneySaved = taxSavings

      const report = {
        totalTaxableIncome,
        estimatedTaxLiability,
        taxSavings,
        moneySaved,
        personalIncome: personalTaxableIncome,
        businessIncome: businessNetIncome,
        filingStatus: userProfile.filing_status,
        dependents: userProfile.dependents,
        generatedDate: new Date().toISOString(),
        reportId: `TAX-${Date.now().toString()}`
      }

      setReportData(report)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }, [personalFinances, businessFinances, userProfile])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const handleDownloadPDF = async () => {
    if (!reportData) return
    
    setDownloading(true)
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a simple text-based report for download
      const reportContent = `
Taxify Tax Analysis Report
Generated: ${new Date().toLocaleDateString()}
Report ID: ${reportData.reportId}

Tax Summary:
- Total Taxable Income: $${reportData.totalTaxableIncome.toLocaleString()}
- Estimated Tax Liability: $${reportData.estimatedTaxLiability.toLocaleString()}
- Tax Savings from Deductions: $${reportData.taxSavings.toLocaleString()}
- Total Money Saved: $${reportData.moneySaved.toLocaleString()}

You saved $${reportData.moneySaved.toLocaleString()} from tax cuts. Without them, you would have spent $${(reportData.estimatedTaxLiability + reportData.moneySaved).toLocaleString()}.

Personal Information:
- Filing Status: ${reportData.filingStatus}
- Dependents: ${reportData.dependents.toString()}

This report was generated using AI-powered tax analysis to help optimize your tax strategy.
      `.trim()

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taxify-report-${reportData.reportId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage('Report downloaded successfully!')
      setTimeout(() => { setMessage('') }, 3000)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleSendEmail = async () => {
    setSending(true)
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage('Report sent to your email successfully!')
      setTimeout(() => { setMessage('') }, 3000)
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your tax report...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error generating report. Please try again.</p>
          <button onClick={onBackToDashboard} className="btn btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="page-container">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={onBackToDashboard}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Tax Analysis Report</h1>
                <p className="text-sm text-gray-600">Report ID: {reportData.reportId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { void handleDownloadPDF() }}
                disabled={downloading}
                className="btn btn-ghost disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
              <button
                onClick={() => { void handleSendEmail() }}
                disabled={sending}
                className="btn btn-primary disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send to Email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Success Message */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800">{message}</span>
            </div>
          </div>
        )}

        {/* Main Report Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tax Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calculator className="h-6 w-6 mr-3 text-blue-600" />
                Tax Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Total Taxable Income</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${reportData.totalTaxableIncome.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Tax Liability</p>
                      <p className="text-2xl font-bold text-red-900">
                        ${reportData.estimatedTaxLiability.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Tax Savings</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${reportData.taxSavings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-800">Money Saved</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${reportData.moneySaved.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insight */}
              <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insight</h3>
                <p className="text-lg text-gray-700">
                  <strong>You saved ${reportData.moneySaved.toLocaleString()} from tax cuts.</strong>{' '}
                  Without them, you would have spent ${(reportData.estimatedTaxLiability + reportData.moneySaved).toLocaleString()}.
                </p>
              </div>
            </div>

            {/* Income Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Personal Income</span>
                  <span className="font-medium">${reportData.personalIncome.toLocaleString()}</span>
                </div>
                {(businessFinances?.annual_revenue ?? 0) > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Business Income</span>
                    <span className="font-medium">${reportData.businessIncome.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 font-semibold">
                  <span className="text-gray-900">Total Taxable Income</span>
                  <span className="text-blue-600">${reportData.totalTaxableIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Filing Status</p>
                  <p className="font-medium capitalize">{reportData.filingStatus.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dependents</p>
                  <p className="font-medium">{reportData.dependents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Report Generated</p>
                  <p className="font-medium">{new Date(reportData.generatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => { void handleDownloadPDF() }}
                  disabled={downloading}
                  className="w-full btn btn-primary disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => { void handleSendEmail() }}
                  disabled={sending}
                  className="w-full btn btn-ghost disabled:opacity-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send to Email'}
                </button>
                <button
                  onClick={onBackToDashboard}
                  className="w-full btn btn-ghost"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}