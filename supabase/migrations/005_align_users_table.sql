-- Align public.users schema with frontend expectations
-- Adds profile fields directly to public.users used by the app UI

-- Add columns if they do not already exist
alter table public.users
  add column if not exists country text,
  add column if not exists filing_status text,
  add column if not exists birth_date date,
  add column if not exists dependents integer default 0,
  add column if not exists spouse_income numeric(15,2) default 0,
  add column if not exists tax_scenarios text[] default '{}'::text[];

-- Optional: basic check constraints for data sanity
alter table public.users
  add constraint if not exists chk_dependents_nonnegative check (dependents >= 0),
  add constraint if not exists chk_spouse_income_nonnegative check (spouse_income >= 0);


