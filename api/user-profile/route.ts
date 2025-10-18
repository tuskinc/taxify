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
const validateUserProfile = (data: any) => {
  const errors: string[] = [];
  
  if (!data.tax_residence_country || typeof data.tax_residence_country !== 'string') {
    errors.push('Tax residence country is required');
  }
  
  if (!data.filing_status || !['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow'].includes(data.filing_status)) {
    errors.push('Filing status is required and must be valid');
  }
  
  if (!data.birth_date) {
    errors.push('Birth date is required');
  } else {
    const dateObj = new Date(data.birth_date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Birth date must be a valid date');
    }
  }
  
  if (data.number_of_dependents !== undefined && (typeof data.number_of_dependents !== 'number' || data.number_of_dependents < 0)) {
    errors.push('Number of dependents must be a non-negative number');
  }
  
  if (data.spouse_income !== undefined && (typeof data.spouse_income !== 'number' || data.spouse_income < 0)) {
    errors.push('Spouse income must be a non-negative number');
  }
  
  return errors;
};

// GET - Fetch user profile
export async function GET(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return createResponse({ success: true, data: data || null });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return createResponse(
      { success: false, error: 'Failed to fetch user profile' },
      500
    );
  }
}

// POST - Create user profile
export async function POST(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, ...profileData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate profile data
    const validationErrors = validateUserProfile(profileData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (existingProfile) {
      return createResponse({ error: 'User profile already exists. Use PUT to update.' }, 400);
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authenticatedUser.id,
        tax_residence_country: profileData.tax_residence_country,
        filing_status: profileData.filing_status,
        birth_date: profileData.birth_date,
        number_of_dependents: profileData.number_of_dependents || 0,
        spouse_income: profileData.spouse_income || 0
      })
      .select()
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'User profile created successfully' });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return createResponse(
      { success: false, error: 'Failed to create user profile' },
      500
    );
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const { user_id, ...profileData } = body;

    // Validate user access
    if (user_id && !validateUserAccess(authenticatedUser.id, user_id)) {
      return createResponse({ error: 'Forbidden - Access denied' }, 403);
    }

    // Validate profile data (only validate provided fields)
    const validationErrors = validateUserProfile(profileData);
    if (validationErrors.length > 0) {
      return createResponse({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, 400);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (profileData.tax_residence_country !== undefined) updateData.tax_residence_country = profileData.tax_residence_country;
    if (profileData.filing_status !== undefined) updateData.filing_status = profileData.filing_status;
    if (profileData.birth_date !== undefined) updateData.birth_date = profileData.birth_date;
    if (profileData.number_of_dependents !== undefined) updateData.number_of_dependents = profileData.number_of_dependents;
    if (profileData.spouse_income !== undefined) updateData.spouse_income = profileData.spouse_income;

    // Validate that at least one field is provided for update
    if (Object.keys(updateData).length === 0) {
      return createResponse({ error: 'At least one field must be provided for update' }, 400);
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', authenticatedUser.id)
      .select()
      .single();

    if (error) throw error;

    return createResponse({ success: true, data, message: 'User profile updated successfully' });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return createResponse(
      { success: false, error: 'Failed to update user profile' },
      500
    );
  }
}

// DELETE - Delete user profile
export async function DELETE(request: Request) {
  try {
    // Authenticate the user
    const authenticatedUser = await authenticateUser(request as any);
    if (!authenticatedUser) {
      return createResponse({ error: 'Unauthorized' }, 401);
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', authenticatedUser.id);

    if (error) throw error;

    return createResponse({ success: true, message: 'User profile deleted successfully' });

  } catch (error) {
    console.error('Error deleting user profile:', error);
    return createResponse(
      { success: false, error: 'Failed to delete user profile' },
      500
    );
  }
}
