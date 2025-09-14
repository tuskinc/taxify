import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaxCalculationTest from '../TaxCalculationTest'

describe('TaxCalculationTest', () => {
  it('renders without crashing', () => {
    render(<TaxCalculationTest />)
    expect(screen.getByText('Tax Calculation Test')).toBeInTheDocument()
  })

  it('displays sample data correctly', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Sample Data')).toBeInTheDocument()
    expect(screen.getByText('Personal Finances')).toBeInTheDocument()
    expect(screen.getByText('Business Finances')).toBeInTheDocument()
    
    // Check sample values
    expect(screen.getByText('$75,000')).toBeInTheDocument() // Annual income
    expect(screen.getByText('$5,000')).toBeInTheDocument() // Other income
    expect(screen.getByText('$12,000')).toBeInTheDocument() // Deductions
    expect(screen.getByText('$2,000')).toBeInTheDocument() // Credits
    expect(screen.getByText('$100,000')).toBeInTheDocument() // Revenue
    expect(screen.getByText('$30,000')).toBeInTheDocument() // Expenses
  })

  it('displays tax impact analysis with correct calculations', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Tax Impact Analysis')).toBeInTheDocument()
    expect(screen.getByText(/Without tax cuts, you would have paid/)).toBeInTheDocument()
    expect(screen.getByText(/With tax cuts, you only paid/)).toBeInTheDocument()
    expect(screen.getByText(/You have earned.*from your tax cuts this year/)).toBeInTheDocument()
  })

  it('shows correct calculated values', () => {
    render(<TaxCalculationTest />)
    
    // Expected calculations:
    // Total income: 75,000 + 5,000 + 100,000 = 180,000
    // Tax before cuts: 180,000 * 0.25 = 45,000
    // Taxable income: 80,000 - 12,000 + 100,000 - 30,000 = 138,000
    // Tax after deductions: 138,000 * 0.25 = 34,500
    // Tax after credits: 34,500 - 2,000 = 32,500
    // Savings: 45,000 - 32,500 = 12,500

    expect(screen.getByText('$45,000')).toBeInTheDocument() // Tax before cuts
    expect(screen.getByText('$32,500')).toBeInTheDocument() // Tax after cuts
    expect(screen.getByText('$12,500')).toBeInTheDocument() // Savings
  })

  it('displays verification section with expected results', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Verification')).toBeInTheDocument()
    expect(screen.getByText('Expected Results:')).toBeInTheDocument()
    expect(screen.getByText('• Total Income: $180,000')).toBeInTheDocument()
    expect(screen.getByText('• Tax Before Cuts: $45,000')).toBeInTheDocument()
    expect(screen.getByText('• Tax After Cuts: $32,500')).toBeInTheDocument()
    expect(screen.getByText('• Total Savings: $12,500')).toBeInTheDocument()
  })

  it('displays detailed breakdown sections', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Calculation Results')).toBeInTheDocument()
    expect(screen.getByText('Income Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Tax Calculations')).toBeInTheDocument()
  })
})
