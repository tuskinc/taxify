-- Seed data for development and testing
-- This file is run after migrations to populate the database with initial data

-- Insert sample users (these will be created through Supabase Auth in production)
-- For development, we'll create some test data

-- Note: In production, users are created through Supabase Auth
-- This seed data is for development/testing purposes only

-- Sample tax data is already inserted in the migration files
-- Additional sample data can be added here for development

-- Sample analysis results for testing
INSERT INTO public.analysis_results (user_id, analysis_type, analysis_data, estimated_tax_liability, estimated_savings, recommendations) VALUES
(
  '00000000-0000-0000-0000-000000000000'::uuid, -- This would be a real user ID in production
  'personal',
  '{
    "income_breakdown": {
      "salary": 75000,
      "freelance": 15000,
      "investment": 5000
    },
    "deductions": {
      "retirement": 6000,
      "mortgage_interest": 12000,
      "charitable": 2000
    },
    "effective_tax_rate": 0.18,
    "marginal_tax_rate": 0.22
  }',
  13500.00,
  2500.00,
  '{
    "optimizations": [
      "Consider increasing 401(k) contributions to maximize employer match",
      "Track all business expenses for freelance income",
      "Consider tax-loss harvesting for investment portfolio"
    ],
    "missed_deductions": [
      "Home office expenses",
      "Professional development courses",
      "Health savings account contributions"
    ]
  }'
);

-- Sample business data
INSERT INTO public.businesses (user_id, business_name, business_type, tax_id, country, state_province, city, address, is_active) VALUES
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Sample Consulting LLC',
  'LLC',
  '12-3456789',
  'US',
  'CA',
  'San Francisco',
  '123 Business St, San Francisco, CA 94105',
  true
);

-- Sample business finances
INSERT INTO public.business_finances (business_id, user_id, gross_revenue, cost_of_goods_sold, office_rent, utilities, insurance, professional_services, marketing_advertising, travel_meals, equipment_purchases, depreciation, other_operating_expenses) VALUES
(
  (SELECT id FROM public.businesses WHERE business_name = 'Sample Consulting LLC' LIMIT 1),
  '00000000-0000-0000-0000-000000000000'::uuid,
  120000.00,
  0.00,
  24000.00,
  3600.00,
  2400.00,
  6000.00,
  12000.00,
  4800.00,
  15000.00,
  3000.00,
  2400.00
);
