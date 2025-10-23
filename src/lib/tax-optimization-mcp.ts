import { supabase } from './supabase';

/**
 * MCP (Modular Cognitive Processor) Integration for Tax Optimization
 * Handles AI-powered tax optimization using OpenAI and structured data processing
 */

export interface TaxOptimizationRequest {
  user_id: string;
  profile_data: {
    filing_status: string;
    dependents: number;
    country: string;
    birth_date?: string;
  };
  financial_data: {
    annual_income: number;
    deductions: number;
    credits: number;
    other_income: number;
    business_expenses?: number;
    business_revenue?: number;
  };
  budget_data: Array<{
    category: string;
    amount: number;
    type: 'income' | 'expense';
    deductible_expenses?: boolean;
    date: string;
  }>;
  investment_data: Array<{
    asset_type: string;
    amount_invested: number;
    current_value: number;
    tax_saving_potential?: number;
    risk_level: string;
  }>;
}

export interface TaxOptimizationResult {
  current_tax: number;
  optimized_tax: number;
  potential_savings: number;
  recommendations: string[];
  chart_data: {
    tax_breakdown: Array<{ name: string; value: number; color: string }>;
    before_after: Array<{ category: string; before: number; after: number }>;
  };
  analysis_data: {
    tax_bracket: string;
    effective_rate: number;
    marginal_rate: number;
    optimization_strategies: string[];
    confidence_score: number;
  };
  suggestions: Array<{
    type: 'deduction' | 'credit' | 'investment' | 'expense' | 'income';
    title: string;
    description: string;
    potential_savings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    time_to_implement: string;
    actionable: boolean;
  }>;
}

export class TaxOptimizationMCP {
  private static instance: TaxOptimizationMCP;

  public static getInstance(): TaxOptimizationMCP {
    if (!TaxOptimizationMCP.instance) {
      TaxOptimizationMCP.instance = new TaxOptimizationMCP();
    }
    return TaxOptimizationMCP.instance;
  }

  /**
   * Process tax optimization using MCP AI analysis
   */
  async optimizeTax(request: TaxOptimizationRequest): Promise<TaxOptimizationResult> {
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('optimize-tax', {
        body: request
      });

      if (error) {
        throw new Error(`Tax optimization failed: ${error.message}`);
      }

      return data.data;
    } catch (error) {
      console.error('Tax optimization MCP error:', error);
      throw new Error('Failed to optimize taxes with AI');
    }
  }

  /**
   * Get latest tax optimization results for user
   */
  async getLatestOptimization(userId: string): Promise<TaxOptimizationResult | null> {
    try {
      const { data, error } = await supabase.rpc('get_latest_tax_optimization', {
        user_id_param: userId
      });

      if (error) {
        console.error('Failed to get latest optimization:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const optimization = data[0];
      
      // Get suggestions for this optimization
      const { data: suggestions, error: suggestionsError } = await supabase.rpc('get_tax_suggestions', {
        optimization_id_param: optimization.id
      });

      if (suggestionsError) {
        console.error('Failed to get suggestions:', suggestionsError);
      }

      return {
        current_tax: optimization.current_tax,
        optimized_tax: optimization.optimized_tax,
        potential_savings: optimization.potential_savings,
        recommendations: (optimization.recommendations as string[]) || [],
        chart_data: (optimization.chart_data as any) || {
          tax_breakdown: [],
          before_after: []
        },
        analysis_data: {
          tax_bracket: 'Unknown',
          effective_rate: 0,
          marginal_rate: 0,
          optimization_strategies: [],
          confidence_score: optimization.confidence_score || 0
        },
        suggestions: (suggestions || []).map((s: any) => ({
          type: s.suggestion_type as 'deduction' | 'credit' | 'investment' | 'expense' | 'income',
          title: s.title,
          description: s.description,
          potential_savings: s.potential_savings,
          difficulty: s.difficulty_level as 'easy' | 'medium' | 'hard',
          time_to_implement: s.time_to_implement,
          actionable: s.is_actionable
        }))
      };
    } catch (error) {
      console.error('Error getting latest optimization:', error);
      return null;
    }
  }

  /**
   * Get user's financial data for optimization
   */
  async getUserFinancialData(userId: string): Promise<TaxOptimizationRequest | null> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }

      // Get personal finances
      const { data: personalFinances } = await supabase
        .from('personal_finances')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get business finances
      const { data: businessFinances } = await supabase
        .from('business_finances')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get budget data
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      // Get investment data
      const { data: investments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId);

      return {
        user_id: userId,
        profile_data: {
          filing_status: profile.filing_status || 'single',
          dependents: profile.dependents || 0,
          country: profile.country || 'US',
          birth_date: profile.birth_date
        },
        financial_data: {
          annual_income: personalFinances?.annual_income || 0,
          deductions: personalFinances?.deductions || 0,
          credits: personalFinances?.credits || 0,
          other_income: personalFinances?.other_income || 0,
          business_expenses: businessFinances?.business_expenses || 0,
          business_revenue: businessFinances?.annual_revenue || 0
        },
        budget_data: (budgets || []).map((budget: any) => ({
          category: budget.category,
          amount: budget.amount,
          type: budget.type,
          deductible_expenses: budget.deductible_expenses || false,
          date: budget.date
        })),
        investment_data: (investments || []).map((investment: any) => ({
          asset_type: investment.asset_type,
          amount_invested: investment.amount_invested,
          current_value: investment.current_value,
          tax_saving_potential: investment.tax_saving_potential || 0,
          risk_level: investment.risk_level
        }))
      };
    } catch (error) {
      console.error('Error getting user financial data:', error);
      return null;
    }
  }

  /**
   * Process tax optimization with AI analysis
   */
  async processTaxOptimization(userId: string): Promise<TaxOptimizationResult | null> {
    try {
      // Get user's financial data
      const financialData = await this.getUserFinancialData(userId);
      if (!financialData) {
        throw new Error('Failed to get user financial data');
      }

      // Process optimization
      const result = await this.optimizeTax(financialData);
      return result;
    } catch (error) {
      console.error('Tax optimization processing error:', error);
      return null;
    }
  }

  /**
   * Get optimization history for user
   */
  async getOptimizationHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('tax_optimization_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get optimization history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting optimization history:', error);
      return [];
    }
  }

  /**
   * Get tax suggestions for a specific optimization
   */
  async getTaxSuggestions(optimizationId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_tax_suggestions', {
        optimization_id_param: optimizationId
      });

      if (error) {
        console.error('Failed to get tax suggestions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting tax suggestions:', error);
      return [];
    }
  }

  /**
   * Mark a suggestion as implemented
   */
  async markSuggestionImplemented(suggestionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tax_suggestions')
        .update({ is_actionable: false })
        .eq('id', suggestionId);

      if (error) {
        console.error('Failed to mark suggestion as implemented:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking suggestion as implemented:', error);
      return false;
    }
  }
}

// Export singleton instance
export const taxOptimizationMCP = TaxOptimizationMCP.getInstance();

// Helper functions for easy use
export const optimizeUserTax = (userId: string) => taxOptimizationMCP.processTaxOptimization(userId);
export const getLatestTaxOptimization = (userId: string) => taxOptimizationMCP.getLatestOptimization(userId);
export const getTaxOptimizationHistory = (userId: string, limit?: number) => taxOptimizationMCP.getOptimizationHistory(userId, limit);
export const getTaxSuggestions = (optimizationId: string) => taxOptimizationMCP.getTaxSuggestions(optimizationId);
export const markSuggestionImplemented = (suggestionId: string) => taxOptimizationMCP.markSuggestionImplemented(suggestionId);
