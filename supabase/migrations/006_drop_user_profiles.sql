-- Drop legacy user_profiles table and related artifacts now that public.users is canonical

-- Drop RLS policies if they exist
drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can delete own profile" on public.user_profiles;

-- Drop trigger if it exists
drop trigger if exists update_user_profiles_updated_at on public.user_profiles;

-- Drop index if it exists
drop index if exists public.idx_user_profiles_user_id;

-- Finally drop the table
drop table if exists public.user_profiles cascade;


