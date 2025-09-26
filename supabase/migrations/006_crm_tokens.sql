-- Store CRM OAuth tokens securely and enforce RLS

-- Ensure pgcrypto is available for encryption primitives
create extension if not exists pgcrypto;

-- Helper to encrypt sensitive tokens. Returns base64-encoded ciphertext
create or replace function public.encrypt_token(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_cipher bytea;
begin
  v_key := current_setting('app.encryption_key', true);
  if v_key is null or v_key = '' then
    raise exception 'Encryption key (app.encryption_key) is not set';
  end if;

  -- AES-256 with compression; output encoded as base64 text for storage
  v_cipher := pgp_sym_encrypt(p_token, v_key, 'cipher-algo=aes256, compress-algo=1');
  return encode(v_cipher, 'base64');
end;
$$;

-- Helper to decrypt previously encrypted tokens stored as base64 text
create or replace function public.decrypt_token(p_cipher_base64 text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_plain bytea;
begin
  v_key := current_setting('app.encryption_key', true);
  if v_key is null or v_key = '' then
    raise exception 'Encryption key (app.encryption_key) is not set';
  end if;

  v_plain := pgp_sym_decrypt(decode(p_cipher_base64, 'base64'), v_key);
  return convert_from(v_plain, 'utf8');
end;
$$;
create table if not exists public.crm_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('quickbooks','xero','zoho','hubspot','salesforce')),
  access_token text not null, -- Encrypted (base64-encoded) using public.encrypt_token
  refresh_token text, -- Encrypted (base64-encoded) using public.encrypt_token
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

-- Function to automatically encrypt CRM tokens on INSERT/UPDATE
create or replace function public.encrypt_crm_tokens()
returns trigger
language plpgsql
security definer
set search_path = public
as $begin
  -- Only run for INSERT and UPDATE operations
  if TG_OP not in ('INSERT', 'UPDATE') then
    return NEW;
  end if;
  
  -- Encrypt access_token if present
  if NEW.access_token is not null and NEW.access_token != '' then
    -- Basic check: encrypted tokens should be base64 and longer than plaintext
    -- This is a heuristic but helps prevent obvious double encryption
    if length(NEW.access_token) < 100 or NEW.access_token !~ '^[A-Za-z0-9+/]*={0,2}
    if length(NEW.access_token) < 100 or NEW.access_token !~ '^[A-Za-z0-9+/]*={0,2} then
      NEW.access_token := public.encrypt_token(NEW.access_token);
    end if;
  end if;
  
  -- Encrypt refresh_token if present
  if NEW.refresh_token is not null and NEW.refresh_token != '' then
    if length(NEW.refresh_token) < 100 or NEW.refresh_token !~ '^[A-Za-z0-9+/]*={0,2}  end if;
  
  return NEW;
end;
$;
-- Trigger to automatically encrypt tokens before INSERT or UPDATE

-- Trigger to automatically encrypt tokens before INSERT or UPDATE
create trigger crm_tokens_encrypt_trigger
  before insert or update on public.crm_connections
  for each row
  execute function public.encrypt_crm_tokens();


 then then
      NEW.access_token := public.encrypt_token(NEW.access_token);
    end if;
  end if;
  
  -- Encrypt refresh_token if present
  if NEW.refresh_token is not null and NEW.refresh_token != '' then
 then
      NEW.refresh_token := public.encrypt_token(NEW.refresh_token);
    end if;  end if;
  
  return NEW;
end;
$;
-- Trigger to automatically encrypt tokens before INSERT or UPDATE
create trigger crm_tokens_encrypt_trigger
  before insert or update on public.crm_connections
  for each row
  execute function public.encrypt_crm_tokens();


