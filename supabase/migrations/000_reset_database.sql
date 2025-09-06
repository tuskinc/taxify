-- Reset database script - Run this if you need to start fresh
-- WARNING: This will delete all data and tables!

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS public.tax_calendar CASCADE;
DROP TABLE IF EXISTS public.analysis_results CASCADE;
DROP TABLE IF EXISTS public.tax_data CASCADE;
DROP TABLE IF EXISTS public.business_finances CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.personal_finances CASCADE;
DROP TABLE IF EXISTS public.tax_scenarios CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS country_code CASCADE;
DROP TYPE IF EXISTS tax_scenario CASCADE;
DROP TYPE IF EXISTS filing_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
