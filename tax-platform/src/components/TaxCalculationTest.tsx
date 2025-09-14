// Test component to verify tax calculations
export default function TaxCalculationTest() {
  // Sample data for testing
  const samplePersonalFinances = {
    annual_income: 75000,
    other_income: 5000,
    deductions: 12000,
    credits: 2000
  }

  const sampleBusinessFinances = {
    annual_revenue: 100000,
    business_expenses: 30000
  }

  // Calculate tax metrics using the same logic as ComprehensiveAnalysisReport
  const personalTaxableIncome = samplePersonalFinances.annual_income + samplePersonalFinances.other_income - samplePersonalFinances.deductions
  const businessNetIncome = sampleBusinessFinances.annual_revenue - sampleBusinessFinances.business_expenses
  const totalTaxableIncome = personalTaxableIncome + businessNetIncome

  // Enhanced tax calculations with before/after cuts
  const totalIncome = samplePersonalFinances.annual_income + samplePersonalFinances.other_income + sampleBusinessFinances.annual_revenue
  const totalDeductions = samplePersonalFinances.deductions + sampleBusinessFinances.business_expenses
  const totalCredits = samplePersonalFinances.credits
  
  // Tax calculation without any deductions or credits (worst case scenario)
  const taxBeforeCuts = totalIncome * 0.25 // Simplified 25% tax rate on gross income
  
  // Tax calculation after deductions but before credits
  const taxAfterDeductions = totalTaxableIncome * 0.25
  
  // Tax calculation after both deductions and credits
  const taxAfterCuts = Math.max(0, taxAfterDeductions - totalCredits)
  
  // Calculate savings from tax cuts
  const taxCutSavings = taxBeforeCuts - taxAfterCuts

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tax Calculation Test</h1>
      
      {/* Sample Data Display */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Personal Finances</h3>
            <ul className="space-y-1 text-sm">
              <li>Annual Income: ${samplePersonalFinances.annual_income.toLocaleString()}</li>
              <li>Other Income: ${samplePersonalFinances.other_income.toLocaleString()}</li>
              <li>Deductions: ${samplePersonalFinances.deductions.toLocaleString()}</li>
              <li>Credits: ${samplePersonalFinances.credits.toLocaleString()}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Business Finances</h3>
            <ul className="space-y-1 text-sm">
              <li>Annual Revenue: ${sampleBusinessFinances.annual_revenue.toLocaleString()}</li>
              <li>Business Expenses: ${sampleBusinessFinances.business_expenses.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calculation Results */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Calculation Results</h2>
        
        {/* Tax Impact Display */}
        <div className="bg-gradient-to-r from-red-50 to-green-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Tax Impact Analysis</h3>
          <div className="space-y-4">
            {/* Without tax cuts */}
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <span className="text-red-800 font-medium">Without tax cuts, you would have paid:</span>
                <span className="text-2xl font-bold text-red-900">${taxBeforeCuts.toLocaleString()}</span>
              </div>
            </div>
            
            {/* With tax cuts */}
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">With tax cuts, you only paid:</span>
                <span className="text-2xl font-bold text-blue-900">${taxAfterCuts.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Savings message */}
            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">🎉 You have earned $Z from your tax cuts this year!</span>
                <span className="text-2xl font-bold text-green-900">${taxCutSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Income Breakdown</h3>
            <ul className="space-y-1 text-sm">
              <li>Total Income: ${totalIncome.toLocaleString()}</li>
              <li>Total Deductions: ${totalDeductions.toLocaleString()}</li>
              <li>Total Credits: ${totalCredits.toLocaleString()}</li>
              <li>Taxable Income: ${totalTaxableIncome.toLocaleString()}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Tax Calculations</h3>
            <ul className="space-y-1 text-sm">
              <li>Tax Before Cuts: ${taxBeforeCuts.toLocaleString()}</li>
              <li>Tax After Deductions: ${taxAfterDeductions.toLocaleString()}</li>
              <li>Tax After Credits: ${taxAfterCuts.toLocaleString()}</li>
              <li>Total Savings: ${taxCutSavings.toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Expected Results:</strong></p>
          <p>• Total Income: $180,000 (75,000 + 5,000 + 100,000)</p>
          <p>• Total Deductions: $42,000 (12,000 + 30,000)</p>
          <p>• Taxable Income: $138,000 (180,000 - 42,000)</p>
          <p>• Tax Before Cuts: $45,000 (180,000 × 0.25)</p>
          <p>• Tax After Deductions: $34,500 (138,000 × 0.25)</p>
          <p>• Tax After Credits: $32,500 (34,500 - 2,000)</p>
          <p>• Total Savings: $12,500 (45,000 - 32,500)</p>
        </div>
      </div>
    </div>
  )
}
