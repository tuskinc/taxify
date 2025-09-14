import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ComprehensiveAnalysisReport from '../ComprehensiveAnalysisReport'

// Mock data for testing
const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com'
}

const mockUserProfile = {
  id: 'test-profile-1',
  country: 'US',
  filing_status: 'single',
  birth_date: '1990-01-01',
  dependents: 0,
  spouse_income: 0,
  tax_scenarios: ['personal']
}

const mockPersonalFinances = {
  id: 'test-personal-1',
  user_id: 'test-user-1',
  annual_income: 75000,
  other_income: 5000,
  deductions: 12000,
  credits: 2000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockBusinessFinances = {
  id: 'test-business-1',
  user_id: 'test-user-1',
  business_name: 'Test Business',
  business_type: 'LLC',
  annual_revenue: 100000,
  business_expenses: 30000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

describe('ComprehensiveAnalysisReport', () => {
  it('renders without crashing', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )
    
    expect(screen.getByText('Tax Analysis Report')).toBeInTheDocument()
  })

  it('displays tax impact analysis with correct calculations', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

    // Check for tax impact analysis section
    expect(screen.getByText('Your Tax Impact Analysis')).toBeInTheDocument()
    
    // Check for the three key lines
    expect(screen.getByText(/Without tax cuts, you would have paid/)).toBeInTheDocument()
    expect(screen.getByText(/With tax cuts, you only paid/)).toBeInTheDocument()
    expect(screen.getByText(/You have earned.*from your tax cuts this year/)).toBeInTheDocument()
  })

  it('displays correct tax calculations', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

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

  it('displays personal finances breakdown', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

    expect(screen.getByText('Personal Finances')).toBeInTheDocument()
    expect(screen.getByText('$75,000')).toBeInTheDocument() // Annual income
    expect(screen.getByText('$5,000')).toBeInTheDocument() // Other income
    expect(screen.getByText('$12,000')).toBeInTheDocument() // Deductions
    expect(screen.getByText('$2,000')).toBeInTheDocument() // Credits
  })

  it('displays business finances when provided', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

    expect(screen.getByText('Business Finances')).toBeInTheDocument()
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('$100,000')).toBeInTheDocument() // Revenue
    expect(screen.getByText('$30,000')).toBeInTheDocument() // Expenses
  })

  it('handles missing business finances gracefully', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

    expect(screen.getByText('Tax Analysis Report')).toBeInTheDocument()
    expect(screen.queryByText('Business Finances')).not.toBeInTheDocument()
  })

  it('displays action buttons', () => {
    render(
      <ComprehensiveAnalysisReport
        user={mockUser}
        userProfile={mockUserProfile}
        personalFinances={mockPersonalFinances}
        businessFinances={mockBusinessFinances}
        onComplete={() => {}}
        onBackToDashboard={() => {}}
      />
    )

    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Print')).toBeInTheDocument()
    expect(screen.getByText('Download PDF')).toBeInTheDocument()
  })
})
