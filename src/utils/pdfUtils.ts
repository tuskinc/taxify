import { generateFinancialReport } from '../api/generate-financial-report';

export async function downloadFinancialReport(userId: string): Promise<void> {
  try {
    // Show loading state
    console.log('Generating PDF report...');
    
    // Generate the PDF
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
    
    console.log('PDF report downloaded successfully');
  } catch (error) {
    console.error('Error downloading PDF report:', error);
    throw new Error('Failed to download PDF report');
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateEffectiveTaxRate(taxOwed: number, totalIncome: number): number {
  if (totalIncome <= 0) return 0;
  return (taxOwed / totalIncome) * 100;
}

export function calculateEstimatedSavings(deductions: number, taxRate: number = 0.25): number {
  return deductions * taxRate;
}
