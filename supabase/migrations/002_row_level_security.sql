-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Tax scenarios policies
CREATE POLICY "Users can view own tax scenarios" ON public.tax_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax scenarios" ON public.tax_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax scenarios" ON public.tax_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax scenarios" ON public.tax_scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Personal finances policies
CREATE POLICY "Users can view own personal finances" ON public.personal_finances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal finances" ON public.personal_finances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal finances" ON public.personal_finances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal finances" ON public.personal_finances
  FOR DELETE USING (auth.uid() = user_id);

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own businesses" ON public.businesses
  FOR DELETE USING (auth.uid() = user_id);

-- Business finances policies
CREATE POLICY "Users can view own business finances" ON public.business_finances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business finances" ON public.business_finances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business finances" ON public.business_finances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own business finances" ON public.business_finances
  FOR DELETE USING (auth.uid() = user_id);

-- Analysis results policies
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis results" ON public.analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis results" ON public.analysis_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis results" ON public.analysis_results
  FOR DELETE USING (auth.uid() = user_id);

-- Tax data policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view tax data" ON public.tax_data
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tax calendar policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view tax calendar" ON public.tax_calendar
  FOR SELECT USING (auth.role() = 'authenticated');
