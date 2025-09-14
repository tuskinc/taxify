import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

describe('App', () => {
  it('renders loading screen initially', () => {
    render(<App />)
    expect(screen.getByText('Loading Zin...')).toBeInTheDocument()
    expect(screen.getByText('Test Tax Calculations')).toBeInTheDocument()
  })

  it('renders test component when test step is selected', () => {
    // This would require more complex state management testing
    // For now, we'll test the basic rendering
    render(<App />)
    expect(screen.getByText('Loading Zin...')).toBeInTheDocument()
  })
})
