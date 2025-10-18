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

// Validation functions
const validatePersonalFinanceData = (data: any) => {
  const errors: string[] = [];
  
  // Validate numeric fields
  const numericFields = [
    'salary_income', 'freelance_income', 'investment_income', 'rental_income', 
    'capital_gains', 'other_income', 'retirement_contributions', 'mortgage_interest',
    'property_taxes', 'charitable_donations', 'medical_expenses', 'childcare_expenses',
    'education_expenses', 'other_deductions'
  ];
  
  for (const field of numericFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] !== 'number' || isNaN(data[field]) || data[field] < 0) {
        errors.push(`${field} must be a non-negative number`);
      }
    }
  }
  
  return errors;
};

// GET - Fetch personal finances
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('personal_finances')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return createResponse({ success: true, data: data || null });

  } catch (error) {
    console.error('Error fetching personal finances:', error);
    return createResponse(
      { success: false, error: 'Failed to fetch personal finances' },
      500
    );
  }
}

// POST - Create personal finances
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, ...financeData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate finance data
    const validationErrors = validatePersonalFinanceData(financeData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Check if personal finances already exist
    const { data: existingFinances } = await supabase
      .from('personal_finances')
      .select('id')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (existingFinances) {
      return createResponse({ error: 'Personal finances already exist. Use PUT to update.' }, 400);
    }

    const { data, error } = await supabase
      .from('personal_finances')
      .insert({
        user_id: authenticatedUser.id,
        salary_income: financeData.salary_income || 0,
        freelance_income: financeData.freelance_income || 0,
        investment_income: financeData.investment_income || 0,
        rental_income: financeData.rental_income || 0,
        capital_gains: financeData.capital_gains || 0,
        other_income: financeData.other_income || 0,
        retirement_contributions: financeData.retirement_contributions || 0,
        mortgage_interest: financeData.mortgage_interest || 0,
        property_taxes: financeData.property_taxes || 0,
        charitable_donations: financeData.charitable_donations || 0,
        medical_expenses: financeData.medical_expenses || 0,
        childcare_expenses: financeData.childcare_expenses || 0,
        education_expenses: financeData.education_expenses || 0,
        other_deductions: financeData.other_deductions || 0
      })
      .select()
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'Personal finances created successfully' });

  } catch (error) {
    console.error('Error creating personal finances:', error);
    return createResponse(
      { success: false, error: 'Failed to create personal finances' },
      500
    );
  }
}

// PUT - Update personal finances
export async function PUT(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, ...financeData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate finance data
    const validationErrors = validatePersonalFinanceData(financeData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    const fields = [
      'salary_income', 'freelance_income', 'investment_income', 'rental_income',
      'capital_gains', 'other_income', 'retirement_contributions', 'mortgage_interest',
      'property_taxes', 'charitable_donations', 'medical_expenses', 'childcare_expenses',
      'education_expenses', 'other_deductions'
    ];

    for (const field of fields) {
      if (financeData[field] !== undefined) {
        updateData[field] = financeData[field];
      }
    }

    // Validate that at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return createResponse({ error: 'At least one field must be provided for update' }, 400);
    }

    const { data, error } = await supabase
      .from('personal_finances')
      .update(updateData)
      .eq('user_id', authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'Personal finances updated successfully' });

  } catch (error) {
    console.error('Error updating personal finances:', error);
    return createResponse(
      { success: false, error: 'Failed to update personal finances' },
      500
    );
  }
}

// DELETE - Delete personal finances
export async function DELETE(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { error } = await supabase
      .from('personal_finances')
      .delete()
      .eq('user_id', authenticatedUser.id);

    if (error) throw error;

    return createResponse({ success: true, message: 'Personal finances deleted successfully' });

  } catch (error) {
    console.error('Error deleting personal finances:', error);
    return createResponse(
      { success: false, error: 'Failed to delete personal finances' },
      500
    );
  }
}
