import { useState, useEffect, useCallback } from 'react'
import { FileText, Download, Mail, ArrowLeft, CheckCircle, DollarSign, TrendingUp, Calculator, AlertCircle, Upload, Loader2, Eye, Brain } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { openaiService, type DocumentAnalysisRequest, type TaxInsightsRequest } from '../lib/openai'


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

interface UploadedFile {
  id?: string
  name: string
  size: number
  type: string
  url?: string
  status: 'uploading' | 'success' | 'error'
  error?: string
}

interface DocumentAnalysis {
  extractedData: any
  insights: string[]
  recommendations: string[]
  confidence: number
  processedAt: string
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
  documentAnalysis?: DocumentAnalysis
  uploadedFiles: UploadedFile[]
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
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [processingDocuments, setProcessingDocuments] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)

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
        reportId: `TAX-${Date.now().toString()}`,
        uploadedFiles: uploadedFiles
      }

      setReportData(report)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }, [personalFinances, businessFinances, userProfile, uploadedFiles])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setMessage('Uploading documents...')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Please log in to upload documents')
        return
      }

      // Add all files to the uploaded files list with uploading status
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading' as const
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])

      // Process each file
      for (const file of Array.from(files)) {
        try {
          // Generate unique filename
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt ?? 'txt'}`
          const filePath = `uploads/${user.id}/${fileName}`

          // Upload to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file)

          if (uploadError) {
            throw new Error(uploadError.message)
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

          // Log upload to database
          const { data: dbData, error: dbError } = await supabase
            .from('document_uploads')
            .insert({
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.type,
              upload_method: 'upload'
            })
            .select()
            .single()

          if (dbError) {
            console.error('Database error:', dbError)
          }

          // Update the file status to success
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name && f.status === 'uploading' 
                ? { ...f, id: dbData?.id, url: publicUrl, status: 'success' as const }
                : f
            )
          )

        } catch (error) {
          console.error('Upload failed for file:', file.name, error)
          
          // Update the file status to error
          setUploadedFiles(prev => 
            prev.map(f => 
              f.name === file.name && f.status === 'uploading' 
                ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
                : f
            )
          )
        }
      }

      setMessage('Documents uploaded successfully! Processing...')
      await processDocuments()

    } catch (error) {
      console.error('Upload process failed:', error)
      setMessage('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const processDocuments = async () => {
    setProcessingDocuments(true)
    try {
      setMessage('AI is analyzing your documents...')

      // Process each uploaded file with OpenAI
      const analysisResults = []
      
      for (const file of uploadedFiles.filter(f => f.status === 'success')) {
        try {
          // For now, we'll simulate file content extraction
          // In a real implementation, you'd extract text from PDFs, images, etc.
          const fileContent = `Simulated content from ${file.name}. This would contain the actual extracted text from the document.`
          
          const documentRequest: DocumentAnalysisRequest = {
            fileContent,
            fileName: file.name,
            fileType: file.type,
            userContext: {
              filingStatus: userProfile.filing_status,
              dependents: userProfile.dependents,
              income: personalFinances.annual_income
            }
          }

          const analysis = await openaiService.analyzeDocument(documentRequest)
          analysisResults.push(analysis)
        } catch (error) {
          console.error(`Failed to analyze ${file.name}:`, error)
        }
      }

      // Combine all analysis results
      const combinedAnalysis = combineAnalysisResults(analysisResults)
      
      const documentAnalysis: DocumentAnalysis = {
        extractedData: combinedAnalysis.extractedData,
        insights: combinedAnalysis.insights,
        recommendations: combinedAnalysis.recommendations,
        confidence: combinedAnalysis.confidence,
        processedAt: new Date().toISOString()
      }

      // Generate additional tax insights using OpenAI
      const taxInsightsRequest: TaxInsightsRequest = {
        financialData: {
          income: personalFinances.annual_income,
          deductions: personalFinances.deductions,
          businessExpenses: businessFinances?.business_expenses || 0,
          filingStatus: userProfile.filing_status,
          dependents: userProfile.dependents
        },
        documentAnalysis: documentAnalysis
      }

      const taxInsights = await openaiService.generateTaxInsights(taxInsightsRequest)
      
      // Merge document analysis with tax insights
      const enhancedAnalysis: DocumentAnalysis = {
        ...documentAnalysis,
        insights: [...documentAnalysis.insights, ...taxInsights.insights],
        recommendations: [...documentAnalysis.recommendations, ...taxInsights.recommendations],
        confidence: Math.max(documentAnalysis.confidence, taxInsights.confidence)
      }

      // Update report data with enhanced analysis
      setReportData(prev => prev ? {
        ...prev,
        documentAnalysis: enhancedAnalysis,
        uploadedFiles
      } : null)

      setMessage('AI analysis completed! Review the findings below.')
    } catch (error) {
      console.error('Document processing failed:', error)
      setMessage('Document processing failed. Please try again.')
    } finally {
      setProcessingDocuments(false)
    }
  }

  const combineAnalysisResults = (results: any[]) => {
    if (results.length === 0) {
      return {
        extractedData: {},
        insights: [],
        recommendations: [],
        confidence: 0.5
      }
    }

    // Combine all insights and recommendations
    const allInsights = results.flatMap(r => r.insights || [])
    const allRecommendations = results.flatMap(r => r.recommendations || [])
    const avgConfidence = results.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / results.length

    // Combine extracted data
    const combinedExtractedData = results.reduce((acc, r) => {
      if (r.extractedData) {
        Object.keys(r.extractedData).forEach(key => {
          if (typeof r.extractedData[key] === 'number') {
            acc[key] = (acc[key] || 0) + r.extractedData[key]
          } else if (Array.isArray(r.extractedData[key])) {
            acc[key] = [...(acc[key] || []), ...r.extractedData[key]]
          } else {
            acc[key] = r.extractedData[key]
          }
        })
      }
      return acc
    }, {})

    return {
      extractedData: combinedExtractedData,
      insights: [...new Set(allInsights)], // Remove duplicates
      recommendations: [...new Set(allRecommendations)], // Remove duplicates
      confidence: avgConfidence
    }
  }

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const handleDownloadPDF = async () => {
    if (!reportData) return
    
    setDownloading(true)
    try {
      setMessage('Generating AI-enhanced report...')
      
      // Generate AI-enhanced report content
      let aiReportContent = ''
      if (reportData.documentAnalysis) {
        try {
          aiReportContent = await openaiService.generateReportContent(
            {
              totalTaxableIncome: reportData.totalTaxableIncome,
              estimatedTaxLiability: reportData.estimatedTaxLiability,
              taxSavings: reportData.taxSavings,
              moneySaved: reportData.moneySaved,
              filingStatus: reportData.filingStatus,
              dependents: reportData.dependents
            },
            reportData.documentAnalysis
          )
        } catch (error) {
          console.error('Failed to generate AI report content:', error)
          aiReportContent = 'AI-enhanced content generation failed. Using standard report.'
        }
      }
      
      // Create a comprehensive report including document analysis
      let reportContent = `
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
`

      // Add document analysis if available
      if (reportData.documentAnalysis) {
        reportContent += `

AI Document Analysis Results:
Confidence: ${Math.round(reportData.documentAnalysis.confidence * 100)}%
Processed: ${new Date(reportData.documentAnalysis.processedAt).toLocaleString()}

Key Insights:
${reportData.documentAnalysis.insights.map(insight => `- ${insight}`).join('\n')}

Recommendations:
${reportData.documentAnalysis.recommendations.map(rec => `- ${rec}`).join('\n')}

Extracted Data:
- Total Income from Documents: $${reportData.documentAnalysis.extractedData.totalIncome?.toLocaleString() || 'N/A'}
- Additional Deductions Found: $${reportData.documentAnalysis.extractedData.deductions?.toLocaleString() || 'N/A'}
- Business Expenses Identified: $${reportData.documentAnalysis.extractedData.businessExpenses?.toLocaleString() || 'N/A'}
`
      }

      // Add uploaded files information
      if (reportData.uploadedFiles && reportData.uploadedFiles.length > 0) {
        reportContent += `

Uploaded Documents:
${reportData.uploadedFiles.map(file => `- ${file.name} (${(file.size / 1024).toFixed(1)} KB)`).join('\n')}
`
      }

      // Add AI-generated content if available
      if (aiReportContent) {
        reportContent += `

AI-Enhanced Analysis:
${aiReportContent}
`
      }

      reportContent += `

This report was generated using OpenAI-powered tax analysis to help optimize your tax strategy.
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

        {/* Document Upload Section */}
        {!showDocumentUpload && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Upload Financial Documents
              </h2>
              <button
                onClick={() => setShowDocumentUpload(true)}
                className="btn btn-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Upload your financial documents (receipts, invoices, bank statements) to get AI-powered insights and more accurate tax calculations.
            </p>
            <div className="flex items-center text-sm text-blue-600">
              <Brain className="h-4 w-4 mr-2" />
              AI will analyze your documents to find additional deductions and tax savings
            </div>
          </div>
        )}

        {showDocumentUpload && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-blue-600" />
                Upload Financial Documents
              </h2>
              <button
                onClick={() => setShowDocumentUpload(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Financial Documents</h3>
              <p className="text-gray-600 mb-4">
                Upload PDFs, Excel files, or images of receipts, invoices, and financial statements
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={uploading || processingDocuments}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  uploading || processingDocuments
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : processingDocuments ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Choose Files'
                )}
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {file.status === 'uploading' && (
                          <div className="flex items-center text-blue-600">
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            <span className="text-sm">Uploading...</span>
                          </div>
                        )}
                        {file.status === 'success' && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Uploaded</span>
                          </div>
                        )}
                        {file.status === 'error' && (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Failed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Document Analysis Results */}
        {reportData?.documentAnalysis && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="h-6 w-6 mr-3 text-blue-600" />
              AI Document Analysis Results
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {reportData.documentAnalysis.insights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {reportData.documentAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <span>Confidence: {Math.round(reportData.documentAnalysis.confidence * 100)}%</span>
                <span className="mx-2">•</span>
                <span>Processed: {new Date(reportData.documentAnalysis.processedAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setShowDocumentUpload(true)}
                className="btn btn-ghost text-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </button>
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