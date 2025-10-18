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
interface TaxAnalysisRequest {
  user_id: string;
  analysis_type: 'personal' | 'business' | 'combined';
  personal_finances?: any;
  business_finances?: any;
  user_profile?: any;
}

interface TaxAnalysisResult {
  estimated_tax_liability: number;
  estimated_savings: number;
  recommendations: any[];
  tax_optimization_plan: any;
  next_steps: string[];
}

// POST - Generate tax analysis
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, analysis_type, personal_finances, business_finances, user_profile } = body as TaxAnalysisRequest;

    // Validate user access
    if (!validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate required fields
    if (!analysis_type || !['personal', 'business', 'combined'].includes(analysis_type)) {
      return createResponse({ error: 'Invalid analysis type' }, 400);
    }

    // Basic tax calculation logic (simplified for demo)
    let estimated_tax_liability = 0;
    let estimated_savings = 0;
    const recommendations: any[] = [];
    const next_steps: string[] = [];

    if (analysis_type === 'personal' || analysis_type === 'combined') {
      if (personal_finances) {
        const total_income = (personal_finances.salary_income || 0) + 
                           (personal_finances.freelance_income || 0) + 
                           (personal_finances.investment_income || 0) + 
                           (personal_finances.rental_income || 0) + 
                           (personal_finances.capital_gains || 0) + 
                           (personal_finances.other_income || 0);

        const total_deductions = (personal_finances.retirement_contributions || 0) + 
                               (personal_finances.mortgage_interest || 0) + 
                               (personal_finances.property_taxes || 0) + 
                               (personal_finances.charitable_donations || 0) + 
                               (personal_finances.medical_expenses || 0) + 
                               (personal_finances.childcare_expenses || 0) + 
                               (personal_finances.education_expenses || 0) + 
                               (personal_finances.other_deductions || 0);

        const taxable_income = Math.max(0, total_income - total_deductions);
        
        // Simple tax calculation (22% rate for demo)
        estimated_tax_liability += taxable_income * 0.22;

        // Generate recommendations
        if (total_deductions < total_income * 0.15) {
          recommendations.push({
            type: 'deduction',
            priority: 'high',
            title: 'Maximize Deductions',
            description: 'Consider increasing retirement contributions or charitable donations to reduce taxable income.',
            potential_savings: Math.min(5000, (total_income * 0.15 - total_deductions) * 0.22)
          });
        }

        if ((personal_finances.retirement_contributions || 0) < 6000) {
          recommendations.push({
            type: 'retirement',
            priority: 'medium',
            title: 'Increase Retirement Contributions',
            description: 'Consider maximizing your IRA contributions to reduce current year taxes.',
            potential_savings: Math.min(1320, (6000 - (personal_finances.retirement_contributions || 0)) * 0.22)
          });
        }
      }
    }

    if (analysis_type === 'business' || analysis_type === 'combined') {
      if (business_finances) {
        const net_business_income = (business_finances.gross_revenue || 0) - 
                                  (business_finances.total_operating_expenses || 0);
        
        // Business tax calculation (simplified)
        estimated_tax_liability += net_business_income * 0.25;

        recommendations.push({
          type: 'business',
          priority: 'high',
          title: 'Business Expense Optimization',
          description: 'Review and categorize all business expenses to ensure maximum deductions.',
          potential_savings: net_business_income * 0.05
        });
      }
    }

    // Calculate total estimated savings
    estimated_savings = recommendations.reduce((sum, rec) => sum + (rec.potential_savings || 0), 0);

    // Generate next steps
    next_steps.push('Review your financial data for accuracy');
    next_steps.push('Consider implementing the recommended strategies');
    next_steps.push('Schedule a consultation with a tax professional');
    next_steps.push('Set up quarterly tax payments if applicable');

    const analysis_result: TaxAnalysisResult = {
      estimated_tax_liability,
      estimated_savings,
      recommendations,
      tax_optimization_plan: {
        short_term: recommendations.filter(r => r.priority === 'high'),
        long_term: recommendations.filter(r => r.priority === 'medium' || r.priority === 'low')
      },
      next_steps
    };

    // Save analysis to database
    const { error } = await supabase
      .from('analysis_results')
      .insert({
        user_id: authenticatedUser.id,
        analysis_type,
        analysis_data: {
          personal_finances,
          business_finances,
          user_profile
        },
        estimated_tax_liability,
        estimated_savings,
        recommendations: analysis_result
      });

    if (error) {
      console.error('Error saving analysis:', error);
      // Continue with response even if save fails
    }

    return createResponse({ 
      success: true, 
      data: analysis_result,
      message: 'Tax analysis completed successfully'
    });

  } catch (error) {
    console.error('Error generating tax analysis:', error);
    return createResponse(
      { success: false, error: 'Failed to generate tax analysis' },
      500
    );
  }
}

// GET - Retrieve tax analysis history
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type');

    let query = supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .order('created_at', { ascending: false });

    if (analysisType && ['personal', 'business', 'combined'].includes(analysisType)) {
      query = query.eq('analysis_type', analysisType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return createResponse({ success: true, data });

  } catch (error) {
    console.error('Error fetching tax analysis:', error);
    return createResponse(
      { success: false, error: 'Failed to fetch tax analysis' },
      500
    );
  }
}
