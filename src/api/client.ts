import { generateFinancialReport } from './generate-financial-report';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export class ApiClient {
  async downloadReport(userId: string): Promise<void> {
    try {
      // Generate PDF directly in the browser
      const pdfBuffer = await generateFinancialReport(userId);
      
      // Create blob and download
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
