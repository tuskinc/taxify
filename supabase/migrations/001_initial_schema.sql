-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE filing_status AS ENUM (
  'single',
  'married_filing_jointly',
  'married_filing_separately',
  'head_of_household',
  'qualifying_widow'
);

CREATE TYPE tax_scenario AS ENUM (
  'personal_family',
  'business_planning',
  'combined'
);

CREATE TYPE country_code AS ENUM (
  'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'BE', 'IE', 'LU', 'PT', 'GR', 'CY', 'MT', 'SI', 'SK', 'CZ', 'HU', 'PL', 'EE', 'LV', 'LT', 'BG', 'RO', 'HR', 'JP', 'KR', 'SG', 'HK', 'NZ', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'UY', 'ZA', 'NG', 'KE', 'EG', 'MA', 'TN', 'DZ', 'IN', 'PK', 'BD', 'LK', 'TH', 'VN', 'ID', 'MY', 'PH', 'TW', 'CN', 'RU', 'UA', 'BY', 'KZ', 'UZ', 'KG', 'TJ', 'TM', 'AF', 'IR', 'IQ', 'SY', 'LB', 'JO', 'IL', 'PS', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'TR', 'GE', 'AM', 'AZ', 'MD', 'RS', 'ME', 'BA', 'MK', 'AL', 'XK'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tax_residence_country country_code NOT NULL,
  filing_status filing_status NOT NULL,
  birth_date DATE NOT NULL,
  number_of_dependents INTEGER DEFAULT 0,
  spouse_income DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tax scenarios table
CREATE TABLE public.tax_scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scenario_type tax_scenario NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scenario_type)
);

-- Personal finances table
CREATE TABLE public.personal_finances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  -- Income sources
  salary_income DECIMAL(15,2) DEFAULT 0,
  freelance_income DECIMAL(15,2) DEFAULT 0,
  investment_income DECIMAL(15,2) DEFAULT 0,
  rental_income DECIMAL(15,2) DEFAULT 0,
  capital_gains DECIMAL(15,2) DEFAULT 0,
  other_income DECIMAL(15,2) DEFAULT 0,
  total_income DECIMAL(15,2) GENERATED ALWAYS AS (
    COALESCE(salary_income, 0) + 
    COALESCE(freelance_income, 0) + 
    COALESCE(investment_income, 0) + 
    COALESCE(rental_income, 0) + 
    COALESCE(capital_gains, 0) + 
    COALESCE(other_income, 0)
  ) STORED,
  -- Deductions
  retirement_contributions DECIMAL(15,2) DEFAULT 0,
  mortgage_interest DECIMAL(15,2) DEFAULT 0,
  property_taxes DECIMAL(15,2) DEFAULT 0,
  charitable_donations DECIMAL(15,2) DEFAULT 0,
  medical_expenses DECIMAL(15,2) DEFAULT 0,
  childcare_expenses DECIMAL(15,2) DEFAULT 0,
  education_expenses DECIMAL(15,2) DEFAULT 0,
  other_deductions DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) GENERATED ALWAYS AS (
    COALESCE(retirement_contributions, 0) + 
    COALESCE(mortgage_interest, 0) + 
    COALESCE(property_taxes, 0) + 
    COALESCE(charitable_donations, 0) + 
    COALESCE(medical_expenses, 0) + 
    COALESCE(childcare_expenses, 0) + 
    COALESCE(education_expenses, 0) + 
    COALESCE(other_deductions, 0)
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Businesses table
CREATE TABLE public.businesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  tax_id TEXT,
  country country_code NOT NULL,
  state_province TEXT,
  city TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business finances table
CREATE TABLE public.business_finances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  -- Revenue
  gross_revenue DECIMAL(15,2) DEFAULT 0,
  -- Operating expenses
  cost_of_goods_sold DECIMAL(15,2) DEFAULT 0,
  office_rent DECIMAL(15,2) DEFAULT 0,
  utilities DECIMAL(15,2) DEFAULT 0,
  insurance DECIMAL(15,2) DEFAULT 0,
  professional_services DECIMAL(15,2) DEFAULT 0,
  marketing_advertising DECIMAL(15,2) DEFAULT 0,
  travel_meals DECIMAL(15,2) DEFAULT 0,
  equipment_purchases DECIMAL(15,2) DEFAULT 0,
  depreciation DECIMAL(15,2) DEFAULT 0,
  other_operating_expenses DECIMAL(15,2) DEFAULT 0,
  total_operating_expenses DECIMAL(15,2) GENERATED ALWAYS AS (
    COALESCE(cost_of_goods_sold, 0) + 
    COALESCE(office_rent, 0) + 
    COALESCE(utilities, 0) + 
    COALESCE(insurance, 0) + 
    COALESCE(professional_services, 0) + 
    COALESCE(marketing_advertising, 0) + 
    COALESCE(travel_meals, 0) + 
    COALESCE(equipment_purchases, 0) + 
    COALESCE(depreciation, 0) + 
    COALESCE(other_operating_expenses, 0)
  ) STORED,
  net_income DECIMAL(15,2) GENERATED ALWAYS AS (
    COALESCE(gross_revenue, 0) - (
      COALESCE(cost_of_goods_sold, 0) + 
      COALESCE(office_rent, 0) + 
      COALESCE(utilities, 0) + 
      COALESCE(insurance, 0) + 
      COALESCE(professional_services, 0) + 
      COALESCE(marketing_advertising, 0) + 
      COALESCE(travel_meals, 0) + 
      COALESCE(equipment_purchases, 0) + 
      COALESCE(depreciation, 0) + 
      COALESCE(other_operating_expenses, 0)
    )
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id)
);

-- Tax data table (for storing AI-generated tax information)
CREATE TABLE public.tax_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country country_code NOT NULL,
  data_type TEXT NOT NULL, -- 'rates', 'deductions', 'credits', 'deadlines'
  data JSONB NOT NULL,
  source TEXT, -- 'ai_generated', 'official', 'third_party'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE public.analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'personal', 'business', 'combined'
  analysis_data JSONB NOT NULL,
  estimated_tax_liability DECIMAL(15,2),
  estimated_savings DECIMAL(15,2),
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax calendar table
CREATE TABLE public.tax_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country country_code NOT NULL,
  deadline_type TEXT NOT NULL, -- 'filing', 'payment', 'extension'
  deadline_date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_tax_scenarios_user_id ON public.tax_scenarios(user_id);
CREATE INDEX idx_personal_finances_user_id ON public.personal_finances(user_id);
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_business_finances_user_id ON public.business_finances(user_id);
CREATE INDEX idx_business_finances_business_id ON public.business_finances(business_id);
CREATE INDEX idx_tax_data_country ON public.tax_data(country);
CREATE INDEX idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX idx_tax_calendar_country ON public.tax_calendar(country);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_scenarios_updated_at BEFORE UPDATE ON public.tax_scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personal_finances_updated_at BEFORE UPDATE ON public.personal_finances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_finances_updated_at BEFORE UPDATE ON public.business_finances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_data_updated_at BEFORE UPDATE ON public.tax_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analysis_results_updated_at BEFORE UPDATE ON public.analysis_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
