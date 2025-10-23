import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Read Vite env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallback to hardcoded values for testing
const finalUrl = supabaseUrl || 'https://fiophmtlfuqswzinckxv.supabase.co';
const finalKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpb3BobXRsZnVxc3d6aW5ja3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTcyNDUsImV4cCI6MjA3MjM5MzI0NX0.4prqP1PkVt-6mB_dsoCfH06e0_sfXuFhE7hUmBWX5zs';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using hardcoded Supabase values. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

console.log('Supabase URL:', finalUrl);
console.log('Supabase Key present:', !!finalKey);

export const supabase = createClient<Database>(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});