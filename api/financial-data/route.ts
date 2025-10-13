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
interface BudgetTransaction {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  notes: string;
  created_at: string;
}

interface Investment {
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

interface FinancialSummary {
  budgets: {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    categoryBreakdown: Record<string, number>;
    monthlyTrend: number;
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

// GET - Fetch financial data
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');
    const dataType = searchParams.get('type'); // 'budgets', 'investments', or 'summary'

    // Use authenticated user's ID instead of trusting the query param
    const userId = authenticatedUser.id;

    // If a user_id was provided in query params, validate it matches the authenticated user
    if (requestedUserId && !validateUserAccess(authenticatedUser.id, requestedUserId)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    if (dataType === 'budgets') {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return createResponse({ success: true, data });
    }

    if (dataType === 'investments') {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Compute returns on-the-fly for each investment
      const investmentsWithReturns = (data || []).map((investment: any) => ({
        ...investment,
        returns: investment.current_value - investment.amount_invested
      }));

      return createResponse({ success: true, data: investmentsWithReturns });
    }

    if (dataType === 'summary') {
      // Fetch both budgets and investments
      const [budgetsResult, investmentsResult] = await Promise.all([
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('investments').select('*').eq('user_id', userId)
      ]);

      if (budgetsResult.error) throw budgetsResult.error;
      if (investmentsResult.error) throw investmentsResult.error;

      const budgets = budgetsResult.data || [];
      const investments = investmentsResult.data || [];

      // Calculate budget summary
      const totalIncome = budgets
        .filter(b => b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0);

      const totalExpenses = budgets
        .filter(b => b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0);

      const categoryBreakdown = budgets
        .filter(b => b.type === 'expense')
        .reduce((acc, b) => {
          acc[b.category] = (acc[b.category] || 0) + b.amount;
          return acc;
        }, {} as Record<string, number>);

      // Calculate investment summary
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

      const summary: FinancialSummary = {
        budgets: {
          totalIncome,
          totalExpenses,
          totalSavings: totalIncome - totalExpenses,
          categoryBreakdown,
          monthlyTrend: 0 // TODO: Calculate actual trend
        },
        investments: {
          totalInvested,
          totalValue,
          totalReturns,
          roiPercentage,
          assetTypeBreakdown,
          riskDistribution
        }
      };

      return createResponse({ success: true, data: summary });
    }

    return createResponse({ error: 'Invalid data type' }, 400);

  } catch (error) {
    console.error('Error fetching financial data:', error);
    return createResponse(
      { success: false, error: 'Failed to fetch financial data' },
      500
    );
  }
}

// POST - Add new financial data
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { type, data, user_id } = body;

    // Use authenticated user's ID instead of trusting the request body
    const userId = authenticatedUser.id;

    // If a user_id was provided in the request body, validate it matches the authenticated user
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    if (type === 'budget') {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          category: data.category,
          amount: data.amount,
          type: data.type,
          date: data.date,
          notes: data.notes
        });

      if (error) throw error;

      return createResponse({ success: true, message: 'Budget transaction added' });
    }

    if (type === 'investment') {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          asset_type: data.asset_type,
          amount_invested: data.amount_invested,
          current_value: data.current_value,
          risk_level: data.risk_level,
          symbol: data.symbol,
          purchase_date: data.purchase_date
        });

      if (error) throw error;

      return createResponse({ success: true, message: 'Investment added' });
    }

    return createResponse({ error: 'Invalid data type' }, 400);

  } catch (error) {
    console.error('Error adding financial data:', error);
    return createResponse(
      { success: false, error: 'Failed to add financial data' },
      500
    );
  }
}

// PUT - Update financial data
export async function PUT(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { type, id, data, user_id } = body;

    if (!id) {
      return createResponse({ error: 'Record ID is required' }, 400);
    }

    // Use authenticated user's ID instead of trusting the request body
    const userId = authenticatedUser.id;

    // If a user_id was provided in the request body, validate it matches the authenticated user
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    if (type === 'budget') {
      // Build sparse update object for budget
      const updateData: any = {};
      
      if (data.category !== undefined) updateData.category = data.category;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.notes !== undefined) updateData.notes = data.notes;

      // Validate that at least one field is provided for update
      if (Object.keys(updateData).length === 0) {
        return createResponse({ error: 'At least one field must be provided for update' }, 400);
      }

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return createResponse({ success: true, message: 'Budget transaction updated' });
    }

    if (type === 'investment') {
      // Build sparse update object for investment
      const updateData: any = {};
      
      if (data.asset_type !== undefined) updateData.asset_type = data.asset_type;
      if (data.amount_invested !== undefined) updateData.amount_invested = data.amount_invested;
      if (data.current_value !== undefined) updateData.current_value = data.current_value;
      if (data.risk_level !== undefined) updateData.risk_level = data.risk_level;
      if (data.symbol !== undefined) updateData.symbol = data.symbol;
      if (data.purchase_date !== undefined) updateData.purchase_date = data.purchase_date;

      // Validate that at least one field is provided for update
      if (Object.keys(updateData).length === 0) {
        return createResponse({ error: 'At least one field must be provided for update' }, 400);
      }

      const { error } = await supabase
        .from('investments')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return createResponse({ success: true, message: 'Investment updated' });
    }

    return createResponse({ error: 'Invalid data type' }, 400);

  } catch (error) {
    console.error('Error updating financial data:', error);
    return createResponse(
      { success: false, error: 'Failed to update financial data' },
      500
    );
  }
}

// DELETE - Remove financial data
export async function DELETE(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const requestedUserId = searchParams.get('user_id');

    if (!id || !type) {
      return createResponse({ error: 'Record ID and type are required' }, 400);
    }

    // Use authenticated user's ID instead of trusting the query param
    const userId = authenticatedUser.id;

    // If a user_id was provided in query params, validate it matches the authenticated user
    if (requestedUserId && !validateUserAccess(authenticatedUser.id, requestedUserId)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    if (type === 'budget') {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return createResponse({ success: true, message: 'Budget transaction deleted' });
    }

    if (type === 'investment') {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return createResponse({ success: true, message: 'Investment deleted' });
    }

    return createResponse({ error: 'Invalid data type' }, 400);

  } catch (error) {
    console.error('Error deleting financial data:', error);
    return createResponse(
      { success: false, error: 'Failed to delete financial data' },
      500
    );
  }
}
