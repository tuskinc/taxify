import { createClient } from '@supabase/supabase-js';
import { authenticateUser, validateUserAccess } from '../lib/auth';

// Simple Response helper for API routes
const createResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface FinancialData {
  budgets: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    categoryBreakdown: Record<string, number>;
  };
  investments: {
    totalInvested: number;
    totalValue: number;
    totalReturns: number;
    roiPercentage: number;
    assetTypeBreakdown: Record<string, number>;
    riskDistribution: Record<string, number>;
  };
}

interface AIInsight {
  type: 'budget' | 'investment' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
}

// POST - Generate AI insights
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, insight_type } = body;

    // Use authenticated user's ID instead of trusting the request body
    const userId = authenticatedUser.id;

    // If a user_id was provided in the request body, validate it matches the authenticated user
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Fetch financial data
    const [budgetsResult, investmentsResult] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('investments').select('*').eq('user_id', userId)
    ]);

    if (budgetsResult.error) throw budgetsResult.error;
    if (investmentsResult.error) throw investmentsResult.error;

    const budgets = budgetsResult.data || [];
    const investments = investmentsResult.data || [];

    // Calculate financial metrics
    const totalIncome = budgets
      .filter(b => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalExpenses = budgets
      .filter(b => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0);

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    const categoryBreakdown = budgets
      .filter(b => b.type === 'expense')
      .reduce((acc, b) => {
        acc[b.category] = (acc[b.category] || 0) + b.amount;
        return acc;
      }, {} as Record<string, number>);

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0);
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalReturns = totalValue - totalInvested;
    const roiPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const assetTypeBreakdown = investments.reduce((acc, inv) => {
      acc[inv.asset_type] = (acc[inv.asset_type] || 0) + inv.current_value;
      return acc;
    }, {} as Record<string, number>);

    const riskDistribution = investments.reduce((acc, inv) => {
      acc[inv.risk_level] = (acc[inv.risk_level] || 0) + inv.current_value;
      return acc;
    }, {} as Record<string, number>);

    // Generate AI insights based on data
    const insights: AIInsight[] = [];

    // Budget insights
    if (insight_type === 'budget' || insight_type === 'all') {
      // Savings rate analysis
      if (savingsRate < 10) {
        insights.push({
          type: 'budget',
          priority: 'high',
          title: 'Low Savings Rate',
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%, which is below the recommended 20%.`,
          recommendation: 'Consider reducing discretionary spending or increasing income to improve your savings rate.',
          impact: 'Improving your savings rate will help build an emergency fund and achieve financial goals faster.'
        });
      } else if (savingsRate >= 20) {
        insights.push({
          type: 'budget',
          priority: 'low',
          title: 'Excellent Savings Rate',
          description: `Your savings rate of ${savingsRate.toFixed(1)}% is excellent and above the recommended 20%.`,
          recommendation: 'Consider investing your excess savings to maximize long-term growth potential.',
          impact: 'Your strong savings rate positions you well for financial independence and wealth building.'
        });
      }

      // Category spending analysis
      const topCategory = Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)[0];

      if (topCategory && topCategory[1] > totalExpenses * 0.4) {
        insights.push({
          type: 'budget',
          priority: 'medium',
          title: 'High Spending Concentration',
          description: `${topCategory[0]} represents ${((topCategory[1] / totalExpenses) * 100).toFixed(1)}% of your total expenses.`,
          recommendation: 'Consider diversifying your spending or finding ways to reduce costs in this category.',
          impact: 'Reducing concentration in one category can improve budget flexibility and reduce financial risk.'
        });
      }

      // Emergency fund analysis
      if (totalSavings < totalExpenses * 3) {
        insights.push({
          type: 'budget',
          priority: 'high',
          title: 'Insufficient Emergency Fund',
          description: `Your current savings of $${totalSavings.toFixed(2)} may not cover 3 months of expenses ($${(totalExpenses * 3).toFixed(2)}).`,
          recommendation: 'Prioritize building an emergency fund covering 3-6 months of expenses.',
          impact: 'An adequate emergency fund provides financial security and prevents debt during unexpected situations.'
        });
      }
    }

    // Investment insights
    if (insight_type === 'investment' || insight_type === 'all') {
      // Portfolio diversification
      const assetTypes = Object.keys(assetTypeBreakdown);
      if (assetTypes.length < 3) {
        insights.push({
          type: 'investment',
          priority: 'medium',
          title: 'Limited Portfolio Diversification',
          description: `Your portfolio is concentrated in ${assetTypes.length} asset type${assetTypes.length === 1 ? '' : 's'}.`,
          recommendation: 'Consider diversifying across different asset types (stocks, bonds, ETFs, real estate) to reduce risk.',
          impact: 'Diversification can help smooth out returns and reduce portfolio volatility.'
        });
      }

      // Risk distribution analysis
      const highRiskPercentage = riskDistribution.high ? (riskDistribution.high / totalValue) * 100 : 0;
      if (highRiskPercentage > 60) {
        insights.push({
          type: 'investment',
          priority: 'medium',
          title: 'High Risk Concentration',
          description: `${highRiskPercentage.toFixed(1)}% of your portfolio is in high-risk investments.`,
          recommendation: 'Consider rebalancing to include more low and medium-risk investments for stability.',
          impact: 'A more balanced risk profile can provide steadier long-term returns.'
        });
      }

      // Performance analysis
      if (roiPercentage < 0) {
        insights.push({
          type: 'investment',
          priority: 'high',
          title: 'Negative Portfolio Returns',
          description: `Your portfolio is currently showing a ${roiPercentage.toFixed(2)}% return.`,
          recommendation: 'Review your investment strategy and consider consulting with a financial advisor.',
          impact: 'Addressing underperformance early can help prevent further losses and improve long-term outcomes.'
        });
      } else if (roiPercentage > 10) {
        insights.push({
          type: 'investment',
          priority: 'low',
          title: 'Strong Portfolio Performance',
          description: `Your portfolio is performing well with a ${roiPercentage.toFixed(2)}% return.`,
          recommendation: 'Consider taking some profits or rebalancing to lock in gains.',
          impact: 'Your strong performance indicates effective investment strategy and market timing.'
        });
      }

      // Investment allocation analysis
      const stockPercentage = assetTypeBreakdown.Stocks ? (assetTypeBreakdown.Stocks / totalValue) * 100 : 0;
      const bondPercentage = assetTypeBreakdown.Bonds ? (assetTypeBreakdown.Bonds / totalValue) * 100 : 0;
      
      if (stockPercentage > 80) {
        insights.push({
          type: 'investment',
          priority: 'medium',
          title: 'Stock-Heavy Portfolio',
          description: `${stockPercentage.toFixed(1)}% of your portfolio is in stocks, which may be too aggressive.`,
          recommendation: 'Consider adding bonds or other fixed-income investments to balance your portfolio.',
          impact: 'A more balanced allocation can reduce volatility while maintaining growth potential.'
        });
      }
    }

    // General financial health insights
    if (insight_type === 'general' || insight_type === 'all') {
      // Overall financial health score
      let healthScore = 0;
      if (savingsRate >= 20) healthScore += 30;
      else if (savingsRate >= 10) healthScore += 20;
      else healthScore += 10;

      if (roiPercentage > 5) healthScore += 25;
      else if (roiPercentage > 0) healthScore += 15;
      else healthScore += 5;

      if (totalSavings >= totalExpenses * 6) healthScore += 25;
      else if (totalSavings >= totalExpenses * 3) healthScore += 20;
      else healthScore += 10;

      if (Object.keys(assetTypeBreakdown).length >= 3) healthScore += 20;
      else healthScore += 10;

      const healthLevel = healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Improvement';

      insights.push({
        type: 'general',
        priority: healthScore < 40 ? 'high' : healthScore < 60 ? 'medium' : 'low',
        title: `Financial Health: ${healthLevel}`,
        description: `Your overall financial health score is ${healthScore}/100.`,
        recommendation: healthScore < 60 ? 'Focus on improving savings rate, building emergency fund, and diversifying investments.' : 'Continue your current financial strategy while monitoring for optimization opportunities.',
        impact: healthScore >= 60 ? 'Your strong financial foundation provides security and growth potential.' : 'Improving your financial health will increase security and wealth-building potential.'
      });
    }

    // Sort insights by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return createResponse({
      success: true,
      data: {
        insights,
        summary: {
          totalInsights: insights.length,
          highPriority: insights.filter(i => i.priority === 'high').length,
          mediumPriority: insights.filter(i => i.priority === 'medium').length,
          lowPriority: insights.filter(i => i.priority === 'low').length
        }
      }
    });

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return createResponse(
      { success: false, error: 'Failed to generate AI insights' },
      500
    );
  }
}
