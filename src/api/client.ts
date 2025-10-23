import { generateFinancialReport } from './generate-financial-report';
import { supabase } from '../lib/supabase';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
  message?: string;
}

export interface BudgetTransaction {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  notes: string;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  asset_type: string;
  amount_invested: number;
  current_value: number;
  risk_level: 'low' | 'medium' | 'high';
  symbol?: string;
  purchase_date?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  tax_residence_country: string;
  filing_status: string;
  birth_date: string;
  number_of_dependents: number;
  spouse_income: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalFinance {
  id: string;
  user_id: string;
  salary_income: number;
  freelance_income: number;
  investment_income: number;
  rental_income: number;
  capital_gains: number;
  other_income: number;
  retirement_contributions: number;
  mortgage_interest: number;
  property_taxes: number;
  charitable_donations: number;
  medical_expenses: number;
  childcare_expenses: number;
  education_expenses: number;
  other_deductions: number;
  total_income: number;
  total_deductions: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessFinance {
  id: string;
  business_id: string;
  user_id: string;
  gross_revenue: number;
  cost_of_goods_sold: number;
  office_rent: number;
  utilities: number;
  insurance: number;
  professional_services: number;
  marketing_advertising: number;
  travel_meals: number;
  equipment_purchases: number;
  depreciation: number;
  other_operating_expenses: number;
  total_operating_expenses: number;
  net_income: number;
  created_at: string;
  updated_at: string;
}

export class ApiClient {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          ...options.headers,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Financial Data API
  async getFinancialData(type: 'budgets' | 'investments' | 'summary'): Promise<ApiResponse<any>> {
    return this.makeRequest(`/financial-data?type=${type}`);
  }

  async addBudgetTransaction(data: Omit<BudgetTransaction, 'id' | 'user_id' | 'created_at'>): Promise<ApiResponse<any>> {
    return this.makeRequest('/financial-data', {
      method: 'POST',
      body: JSON.stringify({ type: 'budget', data })
    });
  }

  async addInvestment(data: Omit<Investment, 'id' | 'user_id' | 'created_at'>): Promise<ApiResponse<any>> {
    return this.makeRequest('/financial-data', {
      method: 'POST',
      body: JSON.stringify({ type: 'investment', data })
    });
  }

  async updateBudgetTransaction(id: string, data: Partial<Omit<BudgetTransaction, 'id' | 'user_id' | 'created_at'>>): Promise<ApiResponse<any>> {
    return this.makeRequest('/financial-data', {
      method: 'PUT',
      body: JSON.stringify({ type: 'budget', id, data })
    });
  }

  async updateInvestment(id: string, data: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at'>>): Promise<ApiResponse<any>> {
    return this.makeRequest('/financial-data', {
      method: 'PUT',
      body: JSON.stringify({ type: 'investment', id, data })
    });
  }

  async deleteFinancialData(type: 'budget' | 'investment', id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/financial-data?type=${type}&id=${id}`, {
      method: 'DELETE'
    });
  }

  // User Profile API
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest('/user-profile');
  }

  async createUserProfile(data: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest('/user-profile', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUserProfile(data: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest('/user-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Personal Finances API
  async getPersonalFinances(): Promise<ApiResponse<PersonalFinance>> {
    return this.makeRequest('/personal-finances');
  }

  async createPersonalFinances(data: Omit<PersonalFinance, 'id' | 'user_id' | 'total_income' | 'total_deductions' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PersonalFinance>> {
    return this.makeRequest('/personal-finances', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePersonalFinances(data: Partial<Omit<PersonalFinance, 'id' | 'user_id' | 'total_income' | 'total_deductions' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<PersonalFinance>> {
    return this.makeRequest('/personal-finances', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Business Finances API
  async getBusinessFinances(): Promise<ApiResponse<BusinessFinance[]>> {
    return this.makeRequest('/business-finances');
  }

  async createBusinessFinances(businessId: string, data: Omit<BusinessFinance, 'id' | 'business_id' | 'user_id' | 'total_operating_expenses' | 'net_income' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BusinessFinance>> {
    return this.makeRequest('/business-finances', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, ...data })
    });
  }

  async updateBusinessFinances(businessId: string, data: Partial<Omit<BusinessFinance, 'id' | 'business_id' | 'user_id' | 'total_operating_expenses' | 'net_income' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<BusinessFinance>> {
    return this.makeRequest('/business-finances', {
      method: 'PUT',
      body: JSON.stringify({ business_id: businessId, ...data })
    });
  }

  // Tax Analysis API
  async generateTaxAnalysis(analysisType: 'personal' | 'business' | 'combined', personalFinances?: any, businessFinances?: any, userProfile?: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/tax-analysis', {
      method: 'POST',
      body: JSON.stringify({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        analysis_type: analysisType,
        personal_finances: personalFinances,
        business_finances: businessFinances,
        user_profile: userProfile
      })
    });
  }

  async getTaxAnalysisHistory(type?: 'personal' | 'business' | 'combined'): Promise<ApiResponse<any[]>> {
    const url = type ? `/tax-analysis?type=${type}` : '/tax-analysis';
    return this.makeRequest(url);
  }

  // AI Insights API
  async getAIInsights(financialData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/ai-insights', {
      method: 'POST',
      body: JSON.stringify({ financial_data: financialData })
    });
  }

  // Document Processing API
  async processDocument(fileUrl: string, fileName: string, fileType: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/process-document', {
      method: 'POST',
      body: JSON.stringify({ fileUrl, fileName, fileType })
    });
  }

  // OCR API
  async processOCR(imageBase64?: string, imageUrl?: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/ocr', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, imageUrl })
    });
  }

  // CRM API
  async connectCRM(provider: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/crm', {
      method: 'POST',
      body: JSON.stringify({ provider, action: 'connect' })
    });
  }

  async fetchCRMData(provider: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/crm', {
      method: 'POST',
      body: JSON.stringify({ provider, action: 'fetch' })
    });
  }

  // Report Generation
  async downloadReport(userId: string): Promise<void> {
    try {
      // Generate PDF directly in the browser
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
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
