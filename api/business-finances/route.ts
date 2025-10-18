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
const validateBusinessFinanceData = (data: any) => {
  const errors: string[] = [];
  
  // Validate numeric fields
  const numericFields = [
    'gross_revenue', 'cost_of_goods_sold', 'office_rent', 'utilities',
    'insurance', 'professional_services', 'marketing_advertising', 'travel_meals',
    'equipment_purchases', 'depreciation', 'other_operating_expenses'
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

// GET - Fetch business finances
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('business_finances')
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          business_type,
          country
        )
      `)
      .eq('user_id', authenticatedUser.id);

    if (error) throw error;

    return createResponse({ success: true, data });

  } catch (error) {
    console.error('Error fetching business finances:', error);
    return createResponse(
      { success: false, error: 'Failed to fetch business finances' },
      500
    );
  }
}

// POST - Create business finances
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, business_id, ...financeData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate business_id
    if (!business_id) {
      return createResponse({ error: 'Business ID is required' }, 400);
    }

    // Verify business belongs to user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('user_id', authenticatedUser.id)
      .single();

    if (businessError || !business) {
      return createResponse({ error: 'Business not found or access denied' }, 404);
    }

    // Validate finance data
    const validationErrors = validateBusinessFinanceData(financeData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Check if business finances already exist
    const { data: existingFinances } = await supabase
      .from('business_finances')
      .select('id')
      .eq('business_id', business_id)
      .single();

    if (existingFinances) {
      return createResponse({ error: 'Business finances already exist. Use PUT to update.' }, 400);
    }

    const { data, error } = await supabase
      .from('business_finances')
      .insert({
        business_id,
        user_id: authenticatedUser.id,
        gross_revenue: financeData.gross_revenue || 0,
        cost_of_goods_sold: financeData.cost_of_goods_sold || 0,
        office_rent: financeData.office_rent || 0,
        utilities: financeData.utilities || 0,
        insurance: financeData.insurance || 0,
        professional_services: financeData.professional_services || 0,
        marketing_advertising: financeData.marketing_advertising || 0,
        travel_meals: financeData.travel_meals || 0,
        equipment_purchases: financeData.equipment_purchases || 0,
        depreciation: financeData.depreciation || 0,
        other_operating_expenses: financeData.other_operating_expenses || 0
      })
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          business_type,
          country
        )
      `)
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'Business finances created successfully' });

  } catch (error) {
    console.error('Error creating business finances:', error);
    return createResponse(
      { success: false, error: 'Failed to create business finances' },
      500
    );
  }
}

// PUT - Update business finances
export async function PUT(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, business_id, ...financeData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate business_id
    if (!business_id) {
      return createResponse({ error: 'Business ID is required' }, 400);
    }

    // Verify business belongs to user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('user_id', authenticatedUser.id)
      .single();

    if (businessError || !business) {
      return createResponse({ error: 'Business not found or access denied' }, 404);
    }

    // Validate finance data
    const validationErrors = validateBusinessFinanceData(financeData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    const fields = [
      'gross_revenue', 'cost_of_goods_sold', 'office_rent', 'utilities',
      'insurance', 'professional_services', 'marketing_advertising', 'travel_meals',
      'equipment_purchases', 'depreciation', 'other_operating_expenses'
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
      .from('business_finances')
      .update(updateData)
      .eq('business_id', business_id)
      .eq('user_id', authenticatedUser.id)
      .select(`
        *,
        businesses!inner(
          id,
          business_name,
          business_type,
          country
        )
      `)
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'Business finances updated successfully' });

  } catch (error) {
    console.error('Error updating business finances:', error);
    return createResponse(
      { success: false, error: 'Failed to update business finances' },
      500
    );
  }
}

// DELETE - Delete business finances
export async function DELETE(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return createResponse({ error: 'Business ID is required' }, 400);
    }

    // Verify business belongs to user
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', authenticatedUser.id)
      .single();

    if (businessError || !business) {
      return createResponse({ error: 'Business not found or access denied' }, 404);
    }

    const { error } = await supabase
      .from('business_finances')
      .delete()
      .eq('business_id', businessId)
      .eq('user_id', authenticatedUser.id);

    if (error) throw error;

    return createResponse({ success: true, message: 'Business finances deleted successfully' });

  } catch (error) {
    console.error('Error deleting business finances:', error);
    return createResponse(
      { success: false, error: 'Failed to delete business finances' },
      500
    );
  }
}
