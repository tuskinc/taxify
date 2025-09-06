import { generateFinancialReport } from './generate-financial-report'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export class ApiClient {
  async downloadReport(userId: string): Promise<void> {
    try {
      const pdfBuffer = await generateFinancialReport(userId)
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `zin-tax-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
