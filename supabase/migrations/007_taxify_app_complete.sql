-- Complete Taxify App Database Schema
-- This migration adds all missing tables and functionality for the Taxify tax planning app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update existing tables to match the app requirements
-- Add missing columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country country_code DEFAULT 'US',
ADD COLUMN IF NOT EXISTS filing_status filing_status DEFAULT 'single',
ADD COLUMN IF NOT EXISTS dependents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_scenarios TEXT[] DEFAULT ARRAY['personal'];

-- Update personal_finances table to match app interface
ALTER TABLE public.personal_finances 
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deductions DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_income DECIMAL(15,2) DEFAULT 0;

-- Update business_finances table to match app interface  
ALTER TABLE public.business_finances
ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS business_expenses DECIMAL(15,2) DEFAULT 0;

-- Create document uploads table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.document_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  upload_method TEXT NOT NULL CHECK (upload_method IN ('camera', 'upload', 'crm')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax reports table for generated reports
CREATE TABLE IF NOT EXISTS public.tax_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  report_id TEXT UNIQUE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('personal', 'business', 'combined')),
  total_taxable_income DECIMAL(15,2) NOT NULL,
  estimated_tax_liability DECIMAL(15,2) NOT NULL,
  tax_savings DECIMAL(15,2) NOT NULL,
  money_saved DECIMAL(15,2) NOT NULL,
  personal_income DECIMAL(15,2) DEFAULT 0,
  business_income DECIMAL(15,2) DEFAULT 0,
  filing_status TEXT NOT NULL,
  dependents INTEGER DEFAULT 0,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for tracking app usage
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_data JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for user alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app settings table for user preferences
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON public.document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_uploads_status ON public.document_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_tax_reports_user_id ON public.tax_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_reports_report_id ON public.tax_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON public.app_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);

-- Enable Row Level Security on all new tables
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_uploads
CREATE POLICY "Users can manage own document uploads"
  ON public.document_uploads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tax_reports
CREATE POLICY "Users can manage own tax reports"
  ON public.tax_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for app_settings
CREATE POLICY "Users can manage own app settings"
  ON public.app_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for audit_log (read-only for users)
CREATE POLICY "Users can view own audit log"
  ON public.audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_document_uploads_updated_at 
  BEFORE UPDATE ON public.document_uploads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_reports_updated_at 
  BEFORE UPDATE ON public.tax_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at 
  BEFORE UPDATE ON public.app_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate unique report IDs
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TAX-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.user_sessions 
  WHERE last_activity < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to create default app settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_settings (user_id, setting_key, setting_value)
  VALUES 
    (NEW.id, 'theme', '"light"'::jsonb),
    (NEW.id, 'notifications', '{"email": true, "push": true}'::jsonb),
    (NEW.id, 'privacy', '{"data_sharing": false}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set up default settings for new users
CREATE TRIGGER create_user_default_settings
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- Insert sample tax data for US
INSERT INTO public.tax_data (country, data_type, data, source) VALUES
('US', 'rates', '{"federal": {"2024": {"single": [{"min": 0, "max": 11000, "rate": 0.10}, {"min": 11000, "max": 44725, "rate": 0.12}, {"min": 44725, "max": 95375, "rate": 0.22}, {"min": 95375, "max": 182050, "rate": 0.24}, {"min": 182050, "max": 231250, "rate": 0.32}, {"min": 231250, "max": 578125, "rate": 0.35}, {"min": 578125, "max": null, "rate": 0.37}]}}}', 'official'),
('US', 'deductions', '{"standard": {"2024": {"single": 13850, "married_joint": 27700, "head_of_household": 20800}}, "itemized": ["mortgage_interest", "property_tax", "charitable_contributions", "medical_expenses"]}', 'official'),
('US', 'credits', '{"child_tax_credit": 2000, "earned_income_credit": "variable", "education_credits": ["american_opportunity", "lifetime_learning"]}', 'official')
ON CONFLICT DO NOTHING;

-- Insert sample tax calendar for US
INSERT INTO public.tax_calendar (country, deadline_type, deadline_date, description, is_recurring) VALUES
('US', 'filing', '2024-04-15', 'Individual Tax Return Filing Deadline', true),
('US', 'payment', '2024-04-15', 'Individual Tax Payment Deadline', true),
('US', 'extension', '2024-10-15', 'Extended Filing Deadline', true),
('US', 'quarterly', '2024-01-15', 'Q4 Estimated Tax Payment', true),
('US', 'quarterly', '2024-04-15', 'Q1 Estimated Tax Payment', true),
('US', 'quarterly', '2024-06-15', 'Q2 Estimated Tax Payment', true),
('US', 'quarterly', '2024-09-15', 'Q3 Estimated Tax Payment', true)
ON CONFLICT DO NOTHING;

-- Create view for user dashboard data
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT 
  u.id as user_id,
  u.email,
  up.filing_status,
  up.dependents,
  up.country,
  COALESCE(pf.annual_income + pf.other_income - pf.deductions, 0) as personal_taxable_income,
  COALESCE(bf.annual_revenue - bf.business_expenses, 0) as business_net_income,
  COALESCE(pf.annual_income + pf.other_income - pf.deductions, 0) + COALESCE(bf.annual_revenue - bf.business_expenses, 0) as total_taxable_income,
  COALESCE(pf.deductions, 0) as total_deductions,
  COALESCE(pf.credits, 0) as total_credits,
  (SELECT COUNT(*) FROM public.document_uploads WHERE user_id = u.id) as documents_uploaded,
  (SELECT COUNT(*) FROM public.tax_reports WHERE user_id = u.id) as reports_generated,
  (SELECT COUNT(*) FROM public.notifications WHERE user_id = u.id AND is_read = FALSE) as unread_notifications
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.personal_finances pf ON u.id = pf.user_id
LEFT JOIN public.business_finances bf ON u.id = bf.user_id;

-- Grant necessary permissions
GRANT SELECT ON public.user_dashboard TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to get user's latest tax report
CREATE OR REPLACE FUNCTION get_latest_tax_report(p_user_id UUID)
RETURNS TABLE (
  report_id TEXT,
  total_taxable_income DECIMAL(15,2),
  estimated_tax_liability DECIMAL(15,2),
  tax_savings DECIMAL(15,2),
  money_saved DECIMAL(15,2),
  generated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.report_id,
    tr.total_taxable_income,
    tr.estimated_tax_liability,
    tr.tax_savings,
    tr.money_saved,
    tr.generated_at
  FROM public.tax_reports tr
  WHERE tr.user_id = p_user_id
  ORDER BY tr.generated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate estimated tax liability
CREATE OR REPLACE FUNCTION calculate_tax_liability(
  p_income DECIMAL(15,2),
  p_filing_status TEXT,
  p_dependents INTEGER DEFAULT 0
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  v_tax_liability DECIMAL(15,2) := 0;
  v_standard_deduction DECIMAL(15,2);
  v_taxable_income DECIMAL(15,2);
BEGIN
  -- Get standard deduction based on filing status
  SELECT CASE p_filing_status
    WHEN 'single' THEN 13850
    WHEN 'married_filing_jointly' THEN 27700
    WHEN 'head_of_household' THEN 20800
    ELSE 13850
  END INTO v_standard_deduction;
  
  -- Calculate taxable income
  v_taxable_income := GREATEST(0, p_income - v_standard_deduction);
  
  -- Simple tax calculation (22% rate for demo)
  v_tax_liability := v_taxable_income * 0.22;
  
  RETURN v_tax_liability;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.document_uploads IS 'Stores information about uploaded financial documents';
COMMENT ON TABLE public.tax_reports IS 'Stores generated tax analysis reports';
COMMENT ON TABLE public.user_sessions IS 'Tracks user session data and activity';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
COMMENT ON TABLE public.app_settings IS 'User application preferences and settings';
COMMENT ON TABLE public.audit_log IS 'Audit trail for data changes';
COMMENT ON VIEW public.user_dashboard IS 'Aggregated view of user data for dashboard display';
