import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database interface for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          country: string
          filing_status: string
          birth_date: string
          dependents: number
          spouse_income: number
          tax_scenarios: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          country: string
          filing_status: string
          birth_date: string
          dependents?: number
          spouse_income?: number
          tax_scenarios?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          country?: string
          filing_status?: string
          birth_date?: string
          dependents?: number
          spouse_income?: number
          tax_scenarios?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      personal_finances: {
        Row: {
          id: string
          user_id: string
          annual_income: number
          deductions: number
          credits: number
          other_income: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          annual_income: number
          deductions?: number
          credits?: number
          other_income?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          annual_income?: number
          deductions?: number
          credits?: number
          other_income?: number
          created_at?: string
          updated_at?: string
        }
      }
      business_finances: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_type: string
          annual_revenue: number
          business_expenses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_type: string
          annual_revenue: number
          business_expenses: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_type?: string
          annual_revenue?: number
          business_expenses?: number
          created_at?: string
          updated_at?: string
        }
      }
      tax_data: {
        Row: {
          id: string
          country: string
          tax_year: number
          tax_brackets: any
          deductions: any
          credits: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country: string
          tax_year: number
          tax_brackets: any
          deductions: any
          credits: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country?: string
          tax_year?: number
          tax_brackets?: any
          deductions?: any
          credits?: any
          created_at?: string
          updated_at?: string
        }
      }
      tax_calendar: {
        Row: {
          id: string
          country: string
          tax_year: number
          important_dates: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country: string
          tax_year: number
          important_dates: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country?: string
          tax_year?: number
          important_dates?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Tax calculation helpers
export const taxHelpers = {
  calculateTax: (income: number, brackets: any[], _country: string) => {
    // Basic tax calculation logic
    let totalTax = 0
    let remainingIncome = income

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
      totalTax += taxableInBracket * (bracket.rate / 100)
      remainingIncome -= taxableInBracket
    }

    return totalTax
  },

  calculateEffectiveRate: (totalTax: number, income: number) => {
    return income > 0 ? (totalTax / income) * 100 : 0
  },

  calculateMarginalRate: (income: number, brackets: any[]) => {
    for (const bracket of brackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate
      }
    }
    return brackets[brackets.length - 1]?.rate || 0
  }
}
