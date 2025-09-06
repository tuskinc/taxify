import React, { useState } from 'react';
import { TaxScenario, PersonalFinances, BusinessFinances } from '../App';
import { RefreshCw, Download, Printer, FileText } from 'lucide-react';
import { apiClient } from '../api/client';

interface ComprehensiveAnalysisReportProps {
  scenario: TaxScenario;
  personalData: Partial<PersonalFinances> | null;
  businessData: Partial<BusinessFinances> | null;
  onReset: () => void;
}

export default function ComprehensiveAnalysisReport({
  scenario,
  personalData,
  businessData,
  onReset
}: ComprehensiveAnalysisReportProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);
      
      // Get current user ID from Supabase
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      await apiClient.downloadReport(user.id);
    } catch (error) {
      console.error('Error downloading report:', error);
      setDownloadError(error instanceof Error ? error.message : 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Comprehensive Tax Analysis Report</h2>
          <p className="text-gray-600">
            Your personalized tax optimization strategy for {scenario} analysis
          </p>
        </div>

        <div className="space-y-6">
          {/* Analysis Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {scenario === 'personal' ? 'Personal' : 
                   scenario === 'business' ? 'Business' : 'Combined'}
                </div>
                <div className="text-gray-600">Analysis Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${personalData ? 
                    (personalData.salary_income || 0) + 
                    (personalData.freelance_income || 0) + 
                    (personalData.investment_income || 0) + 
                    (personalData.rental_income || 0) + 
                    (personalData.capital_gains || 0) : 0
                  .toLocaleString()}
                </div>
                <div className="text-gray-600">Total Personal Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${businessData ? businessData.revenue?.toLocaleString() || '0' : '0'}
                </div>
                <div className="text-gray-600">Business Revenue</div>
              </div>
            </div>
          </div>

          {/* Tax Optimization Strategies */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Optimization Strategies</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Retirement Planning</h4>
                <p className="text-gray-600 text-sm">
                  Maximize your retirement contributions to reduce taxable income and build wealth.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Deduction Optimization</h4>
                <p className="text-gray-600 text-sm">
                  Consider itemizing deductions if they exceed the standard deduction amount.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Tax-Efficient Investing</h4>
                <p className="text-gray-600 text-sm">
                  Utilize tax-advantaged accounts and consider tax-loss harvesting strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Review and maximize retirement contributions
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Gather documentation for itemized deductions
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Consider tax-loss harvesting opportunities
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Plan quarterly estimated tax payments
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handlePrint}
              className="btn-secondary"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Report
            </button>
            
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary"
            >
              {downloading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </div>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Report
                </>
              )}
            </button>
            
            <button
              onClick={onReset}
              className="btn-warning"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start New Analysis
            </button>
          </div>

          {/* Download Error */}
          {downloadError && (
            <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-700 text-sm text-center">
                {downloadError}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          This analysis is for informational purposes only and should not be considered as tax advice. 
          Please consult with a qualified tax professional for specific guidance.
        </p>
      </div>
    </div>
  );
}
