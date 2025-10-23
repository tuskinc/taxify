import { openaiService } from './openai';

/**
 * AI-powered utilities for various app features
 */

export interface AIInsight {
  title: string;
  description: string;
  confidence: number;
  category: 'tax' | 'financial' | 'investment' | 'budgeting';
  actionable: boolean;
}

export interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedSavings?: number;
  timeframe?: string;
  category: string;
}

export class AIUtils {
  /**
   * Generate personalized tax insights based on user data
   */
  static async generateTaxInsights(userData: any): Promise<AIInsight[]> {
    try {
      const response = await openaiService.generateTaxInsights({
        financialData: userData,
        documentAnalysis: null
      });

      return response.insights.map((insight, index) => ({
        title: `Tax Insight ${index + 1}`,
        description: insight,
        confidence: response.confidence,
        category: 'tax' as const,
        actionable: insight.toLowerCase().includes('consider') || insight.toLowerCase().includes('recommend')
      }));
    } catch (error) {
      console.error('Failed to generate tax insights:', error);
      return [];
    }
  }

  /**
   * Generate financial recommendations
   */
  static async generateFinancialRecommendations(userData: any): Promise<AIRecommendation[]> {
    try {
      const response = await openaiService.getFinancialAdvice(userData);

      return response.recommendations.map((rec, index) => ({
        title: `Recommendation ${index + 1}`,
        description: rec,
        priority: this.determinePriority(rec),
        category: this.categorizeRecommendation(rec),
        timeframe: this.extractTimeframe(rec)
      }));
    } catch (error) {
      console.error('Failed to generate financial recommendations:', error);
      return [];
    }
  }

  /**
   * Generate AI-powered budget suggestions
   */
  static async generateBudgetSuggestions(income: number, expenses: any[]): Promise<any> {
    try {
      const context = {
        income,
        expenses,
        type: 'budget_analysis'
      };

      const response = await openaiService.getFinancialAdvice(context);
      
      return {
        suggestions: response.insights,
        recommendations: response.recommendations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to generate budget suggestions:', error);
      return { suggestions: [], recommendations: [], confidence: 0.5 };
    }
  }

  /**
   * Generate investment advice
   */
  static async generateInvestmentAdvice(portfolio: any, riskProfile: string): Promise<any> {
    try {
      const context = {
        portfolio,
        riskProfile,
        type: 'investment_advice'
      };

      const response = await openaiService.getFinancialAdvice(context);
      
      return {
        advice: response.insights,
        recommendations: response.recommendations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to generate investment advice:', error);
      return { advice: [], recommendations: [], confidence: 0.5 };
    }
  }

  /**
   * Generate personalized financial tips
   */
  static async generateFinancialTips(userProfile: any): Promise<string[]> {
    try {
      const context = {
        ...userProfile,
        type: 'financial_tips'
      };

      const response = await openaiService.getFinancialAdvice(context);
      return response.insights;
    } catch (error) {
      console.error('Failed to generate financial tips:', error);
      return [];
    }
  }

  /**
   * Analyze spending patterns and suggest optimizations
   */
  static async analyzeSpendingPatterns(transactions: any[]): Promise<any> {
    try {
      const context = {
        transactions,
        type: 'spending_analysis'
      };

      const response = await openaiService.getFinancialAdvice(context);
      
      return {
        patterns: response.insights,
        optimizations: response.recommendations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to analyze spending patterns:', error);
      return { patterns: [], optimizations: [], confidence: 0.5 };
    }
  }

  /**
   * Generate tax optimization strategies
   */
  static async generateTaxOptimizationStrategies(financialData: any): Promise<any> {
    try {
      const response = await openaiService.generateTaxInsights({
        financialData,
        documentAnalysis: null
      });

      return {
        strategies: response.insights,
        recommendations: response.recommendations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to generate tax optimization strategies:', error);
      return { strategies: [], recommendations: [], confidence: 0.5 };
    }
  }

  /**
   * Generate retirement planning advice
   */
  static async generateRetirementAdvice(userData: any): Promise<any> {
    try {
      const context = {
        ...userData,
        type: 'retirement_planning'
      };

      const response = await openaiService.getFinancialAdvice(context);
      
      return {
        advice: response.insights,
        recommendations: response.recommendations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Failed to generate retirement advice:', error);
      return { advice: [], recommendations: [], confidence: 0.5 };
    }
  }

  // Helper methods
  private static determinePriority(recommendation: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['urgent', 'immediately', 'critical', 'important'];
    const mediumPriorityKeywords = ['consider', 'suggest', 'recommend'];
    
    const lowerRec = recommendation.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => lowerRec.includes(keyword))) {
      return 'high';
    } else if (mediumPriorityKeywords.some(keyword => lowerRec.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  private static categorizeRecommendation(recommendation: string): string {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('tax') || lowerRec.includes('deduction')) return 'tax';
    if (lowerRec.includes('investment') || lowerRec.includes('portfolio')) return 'investment';
    if (lowerRec.includes('budget') || lowerRec.includes('expense')) return 'budgeting';
    if (lowerRec.includes('retirement') || lowerRec.includes('401k')) return 'retirement';
    
    return 'general';
  }

  private static extractTimeframe(recommendation: string): string {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('immediately') || lowerRec.includes('now')) return 'immediate';
    if (lowerRec.includes('this year') || lowerRec.includes('annual')) return 'this year';
    if (lowerRec.includes('next year') || lowerRec.includes('upcoming')) return 'next year';
    if (lowerRec.includes('long term') || lowerRec.includes('future')) return 'long term';
    
    return 'flexible';
  }
}

// Export utility functions for easy use
export const generateTaxInsights = AIUtils.generateTaxInsights;
export const generateFinancialRecommendations = AIUtils.generateFinancialRecommendations;
export const generateBudgetSuggestions = AIUtils.generateBudgetSuggestions;
export const generateInvestmentAdvice = AIUtils.generateInvestmentAdvice;
export const generateFinancialTips = AIUtils.generateFinancialTips;
export const analyzeSpendingPatterns = AIUtils.analyzeSpendingPatterns;
export const generateTaxOptimizationStrategies = AIUtils.generateTaxOptimizationStrategies;
export const generateRetirementAdvice = AIUtils.generateRetirementAdvice;
