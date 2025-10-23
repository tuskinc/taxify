/**
 * Examples of how to use OpenAI features throughout the app
 * This file demonstrates various AI integration patterns
 */

import { openaiService } from './openai';
import { 
  generateTaxInsights, 
  generateFinancialRecommendations,
  generateBudgetSuggestions,
  analyzeSpendingPatterns 
} from './ai-utils';

// Example 1: Dashboard AI Insights
export async function getDashboardInsights(userProfile: any, financialData: any) {
  try {
    // Get personalized tax insights
    const taxInsights = await generateTaxInsights({
      income: financialData.annual_income,
      deductions: financialData.deductions,
      filingStatus: userProfile.filing_status,
      dependents: userProfile.dependents
    });

    // Get financial recommendations
    const recommendations = await generateFinancialRecommendations({
      income: financialData.annual_income,
      expenses: financialData.expenses,
      goals: userProfile.financial_goals
    });

    return {
      taxInsights,
      recommendations,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get dashboard insights:', error);
    return { taxInsights: [], recommendations: [], lastUpdated: new Date().toISOString() };
  }
}

// Example 2: Budgeting Page AI Features
export async function getBudgetAnalysis(income: number, expenses: any[]) {
  try {
    // Get AI budget suggestions
    const budgetSuggestions = await generateBudgetSuggestions(income, expenses);
    
    // Analyze spending patterns
    const spendingAnalysis = await analyzeSpendingPatterns(expenses);
    
    return {
      suggestions: budgetSuggestions.suggestions,
      recommendations: budgetSuggestions.recommendations,
      patterns: spendingAnalysis.patterns,
      optimizations: spendingAnalysis.optimizations,
      confidence: Math.min(budgetSuggestions.confidence, spendingAnalysis.confidence)
    };
  } catch (error) {
    console.error('Failed to get budget analysis:', error);
    return { suggestions: [], recommendations: [], patterns: [], optimizations: [], confidence: 0.5 };
  }
}

// Example 3: Investment Page AI Features
export async function getInvestmentAdvice(portfolio: any, riskProfile: string) {
  try {
    const advice = await openaiService.getFinancialAdvice({
      portfolio,
      riskProfile,
      type: 'investment_advice'
    });

    return {
      advice: advice.insights,
      recommendations: advice.recommendations,
      confidence: advice.confidence
    };
  } catch (error) {
    console.error('Failed to get investment advice:', error);
    return { advice: [], recommendations: [], confidence: 0.5 };
  }
}

// Example 4: Tax Calendar AI Features
export async function getTaxCalendarInsights(userProfile: any, financialData: any) {
  try {
    const insights = await openaiService.generateTaxInsights({
      financialData: {
        income: financialData.annual_income,
        deductions: financialData.deductions,
        businessExpenses: financialData.business_expenses || 0,
        filingStatus: userProfile.filing_status,
        dependents: userProfile.dependents
      },
      documentAnalysis: null
    });

    return {
      insights: insights.insights,
      recommendations: insights.recommendations,
      confidence: insights.confidence,
      nextActions: generateNextActions(insights.recommendations)
    };
  } catch (error) {
    console.error('Failed to get tax calendar insights:', error);
    return { insights: [], recommendations: [], confidence: 0.5, nextActions: [] };
  }
}

// Example 5: Smart Notifications
export async function generateSmartNotifications(userData: any) {
  try {
    const advice = await openaiService.getFinancialAdvice({
      ...userData,
      type: 'smart_notifications'
    });

    return advice.insights.map((insight, index) => ({
      id: `notification-${Date.now()}-${index}`,
      type: 'ai_insight',
      title: 'AI Financial Insight',
      message: insight,
      priority: determineNotificationPriority(insight),
      timestamp: new Date().toISOString(),
      actionable: insight.toLowerCase().includes('consider') || insight.toLowerCase().includes('recommend')
    }));
  } catch (error) {
    console.error('Failed to generate smart notifications:', error);
    return [];
  }
}

// Example 6: Document Processing Pipeline
export async function processDocumentPipeline(file: File, userContext: any) {
  try {
    // Step 1: Extract text content (you'd implement this based on file type)
    const fileContent = await extractTextFromFile(file);
    
    // Step 2: Analyze with OpenAI
    const analysis = await openaiService.analyzeDocument({
      fileContent,
      fileName: file.name,
      fileType: file.type,
      userContext
    });

    // Step 3: Generate additional insights
    const additionalInsights = await openaiService.generateTaxInsights({
      financialData: userContext,
      documentAnalysis: analysis
    });

    // Step 4: Combine results
    return {
      documentAnalysis: analysis,
      additionalInsights,
      combinedInsights: [...analysis.insights, ...additionalInsights.insights],
      combinedRecommendations: [...analysis.recommendations, ...additionalInsights.recommendations],
      overallConfidence: Math.max(analysis.confidence, additionalInsights.confidence)
    };
  } catch (error) {
    console.error('Failed to process document pipeline:', error);
    throw error;
  }
}

// Helper functions
function generateNextActions(recommendations: string[]): string[] {
  return recommendations
    .filter(rec => rec.toLowerCase().includes('consider') || rec.toLowerCase().includes('recommend'))
    .map(rec => `Action: ${rec}`)
    .slice(0, 3); // Limit to top 3 actions
}

function determineNotificationPriority(insight: string): 'high' | 'medium' | 'low' {
  const highPriorityKeywords = ['urgent', 'immediately', 'critical', 'deadline'];
  const mediumPriorityKeywords = ['consider', 'suggest', 'recommend'];
  
  const lowerInsight = insight.toLowerCase();
  
  if (highPriorityKeywords.some(keyword => lowerInsight.includes(keyword))) {
    return 'high';
  } else if (mediumPriorityKeywords.some(keyword => lowerInsight.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

async function extractTextFromFile(file: File): Promise<string> {
  // This is a placeholder - you'd implement actual text extraction
  // based on file type (PDF, image, etc.)
  return `Extracted text content from ${file.name}`;
}

// All functions are already exported above
