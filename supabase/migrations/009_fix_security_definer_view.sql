-- Fix Security Definer View Issue
-- This migration addresses the security issue with the user_dashboard view

-- Drop the existing view
DROP VIEW IF EXISTS public.user_dashboard;

-- Recreate the view with SECURITY INVOKER (default behavior)
-- This ensures the view runs with the permissions of the querying user, not the view creator
CREATE VIEW public.user_dashboard 
WITH (security_invoker = true) AS
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

-- Add comment to document the security approach
COMMENT ON VIEW public.user_dashboard IS 'User dashboard view with SECURITY INVOKER to ensure proper RLS enforcement';

-- Also fix the get_latest_tax_report function to use SECURITY INVOKER
DROP FUNCTION IF EXISTS get_latest_tax_report(UUID);

CREATE OR REPLACE FUNCTION get_latest_tax_report(p_user_id UUID)
RETURNS TABLE (
  report_id TEXT,
  total_taxable_income DECIMAL(15,2),
  estimated_tax_liability DECIMAL(15,2),
  tax_savings DECIMAL(15,2),
  money_saved DECIMAL(15,2),
  generated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY INVOKER  -- Use SECURITY INVOKER instead of SECURITY DEFINER
AS $$
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
$$;

-- Add comment to document the security approach
COMMENT ON FUNCTION get_latest_tax_report(UUID) IS 'Function with SECURITY INVOKER to ensure proper RLS enforcement';

-- Also fix the calculate_tax_liability function
DROP FUNCTION IF EXISTS calculate_tax_liability(DECIMAL, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION calculate_tax_liability(
  p_income DECIMAL(15,2),
  p_filing_status TEXT,
  p_dependents INTEGER DEFAULT 0
)
RETURNS DECIMAL(15,2)
LANGUAGE plpgsql
SECURITY INVOKER  -- Use SECURITY INVOKER instead of SECURITY DEFINER
AS $$
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
$$;

-- Add comment to document the security approach
COMMENT ON FUNCTION calculate_tax_liability(DECIMAL, TEXT, INTEGER) IS 'Function with SECURITY INVOKER to ensure proper RLS enforcement';
