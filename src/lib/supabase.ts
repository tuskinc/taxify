import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read Vite env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Storage bucket names
export const BUCKET_NAMES = {
  DOCUMENTS: 'documents',
} as const;

// File upload settings
export const UPLOAD_SETTINGS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
};

// Helper functions for storage
export const storageHelpers = {
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  generateUniqueFilename: (filename: string): string => {
    const ext = storageHelpers.getFileExtension(filename);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${randomStr}.${ext}`;
  },

  isFileTypeAllowed: (file: File): boolean => {
    return UPLOAD_SETTINGS.ALLOWED_FILE_TYPES.includes(file.type);
  },

  isFileSizeValid: (file: File): boolean => {
    return file.size <= UPLOAD_SETTINGS.MAX_FILE_SIZE;
  },
};

// Helper functions for tax calculations
export const taxHelpers = {
  calculateTaxBrackets: (income: number, brackets: any[]) => {
    let totalTax = 0;
    let remainingIncome = income;
    
    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;
      
      const bracketIncome = Math.min(remainingIncome, bracket.max - bracket.min);
      totalTax += bracketIncome * (bracket.rate / 100);
      remainingIncome -= bracketIncome;
    }
    
    return totalTax;
  },
  
  optimizeDeductions: (expenses: any, standardDeduction: number) => {
    const itemizedTotal = Object.values(expenses).reduce((sum: number, expense: any) => sum + (expense || 0), 0);
    return itemizedTotal > standardDeduction ? 'itemized' : 'standard';
  },
  
  calculateEffectiveRate: (taxOwed: number, income: number) => {
    return income > 0 ? (taxOwed / income) * 100 : 0;
  },
  
  calculateMarginalRate: (income: number, brackets: any[]) => {
    for (const bracket of brackets) {
      if (income <= bracket.max) {
        return bracket.rate;
      }
    }
    return brackets[brackets.length - 1]?.rate || 0;
  }
};

// (Using generated Database types from ./database.types)
