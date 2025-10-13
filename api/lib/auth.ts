import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for auth verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use the anon key for auth verification (not service role key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Authenticates a user from the request headers
 * @param request - The incoming request
 * @returns Promise<AuthenticatedUser | null> - The authenticated user or null if not authenticated
 */
export async function authenticateUser(request: Request): Promise<AuthenticatedUser | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract the JWT token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification failed:', error);
      return null;
    }

    return {
      id: user.id,
      email: user.email
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Validates that the requested user_id matches the authenticated user
 * @param authenticatedUserId - The ID of the authenticated user
 * @param requestedUserId - The user_id from the request
 * @returns boolean - True if the user is authorized to access this data
 */
export function validateUserAccess(authenticatedUserId: string, requestedUserId: string): boolean {
  return authenticatedUserId === requestedUserId;
}
