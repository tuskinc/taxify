-- Store CRM OAuth tokens securely and enforce RLS
create table if not exists public.crm_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('quickbooks','xero','zoho','hubspot','salesforce')),
  access_token text not null, -- TODO: Encrypt using pgcrypto
  refresh_token text, -- TODO: Encrypt using pgcrypto
  scope text,
  expires_at timestamptz not null, -- Token lifecycle management
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider) -- Prevent duplicate connections per user/provider
);

-- Add index for common query patterns
create index if not exists idx_crm_connections_user_provider 
  on public.crm_connections(user_id, provider);
alter table public.crm_connections enable row level security;

create policy "Users manage own CRM connections"
  on public.crm_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Table for imported financial data provenance (optional scaffold)
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null check (method in ('upload','ocr','crm')),
  provider text,
  reference text,
  created_at timestamptz not null default now()
);

alter table public.data_sources enable row level security;

create policy "Users see own data sources"
  on public.data_sources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


