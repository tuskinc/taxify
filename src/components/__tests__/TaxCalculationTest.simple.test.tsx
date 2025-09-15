import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TaxCalculationTest from '../TaxCalculationTest'

describe('TaxCalculationTest', () => {
  it('renders without crashing', () => {
    render(<TaxCalculationTest />)
    expect(screen.getByText('Tax Calculation Test')).toBeInTheDocument()
  })

  it('displays sample data section', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Sample Data')).toBeInTheDocument()
    expect(screen.getByText('Personal Finances')).toBeInTheDocument()
    expect(screen.getByText('Business Finances')).toBeInTheDocument()
  })

  it('displays tax impact analysis section', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Tax Impact Analysis')).toBeInTheDocument()
    expect(screen.getByText(/Without tax cuts, you would have paid/)).toBeInTheDocument()
    expect(screen.getByText(/With tax cuts, you only paid/)).toBeInTheDocument()
    expect(screen.getByText(/You have earned.*from your tax cuts this year/)).toBeInTheDocument()
  })

  it('displays calculation results section', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Calculation Results')).toBeInTheDocument()
    expect(screen.getByText('Income Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Tax Calculations')).toBeInTheDocument()
  })

  it('displays verification section', () => {
    render(<TaxCalculationTest />)
    
    expect(screen.getByText('Verification')).toBeInTheDocument()
    expect(screen.getByText('Expected Results:')).toBeInTheDocument()
  })

  it('contains expected monetary values', () => {
    render(<TaxCalculationTest />)
    
    // Check that key values are present (using getAllByText to handle multiple occurrences)
    expect(screen.getAllByText(/45,000/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/32,500/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/12,500/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/180,000/).length).toBeGreaterThan(0)
  })
})
