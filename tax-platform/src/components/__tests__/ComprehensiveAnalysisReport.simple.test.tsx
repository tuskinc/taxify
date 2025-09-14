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

  it('displays tax impact analysis section', () => {
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

    expect(screen.getByText('Your Tax Impact Analysis')).toBeInTheDocument()
    expect(screen.getByText(/Without tax cuts, you would have paid/)).toBeInTheDocument()
    expect(screen.getByText(/With tax cuts, you only paid/)).toBeInTheDocument()
    expect(screen.getByText(/You have earned.*from your tax cuts this year/)).toBeInTheDocument()
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

  it('displays financial breakdown sections', () => {
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

    expect(screen.getByText('Financial Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Personal Finances')).toBeInTheDocument()
    expect(screen.getByText('Business Finances')).toBeInTheDocument()
  })

  it('displays recommendations section', () => {
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

    expect(screen.getByText('Tax Optimization Recommendations')).toBeInTheDocument()
  })
})
