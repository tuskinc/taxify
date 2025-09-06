-- Insert sample tax data for different countries
INSERT INTO public.tax_data (country, data_type, data, source) VALUES
('US', 'rates', '{
  "federal": {
    "2024": [
      {"bracket": 0, "rate": 0.10, "max_income": 11000},
      {"bracket": 1, "rate": 0.12, "max_income": 44725},
      {"bracket": 2, "rate": 0.22, "max_income": 95375},
      {"bracket": 3, "rate": 0.24, "max_income": 182050},
      {"bracket": 4, "rate": 0.32, "max_income": 231250},
      {"bracket": 5, "rate": 0.35, "max_income": 578125},
      {"bracket": 6, "rate": 0.37, "max_income": null}
    ]
  },
  "state": {
    "california": {"rate": 0.013, "max_income": 1000000},
    "new_york": {"rate": 0.04, "max_income": 1000000},
    "texas": {"rate": 0, "max_income": null}
  }
}', 'official'),

('US', 'deductions', '{
  "standard_deduction": {
    "single": 13850,
    "married_filing_jointly": 27700,
    "head_of_household": 20800
  },
  "itemized_deductions": {
    "mortgage_interest": {"limit": 750000, "description": "Interest on mortgage debt up to $750,000"},
    "state_local_taxes": {"limit": 10000, "description": "State and local taxes up to $10,000"},
    "charitable_contributions": {"limit": 0.6, "description": "Up to 60% of AGI"},
    "medical_expenses": {"threshold": 0.075, "description": "Expenses exceeding 7.5% of AGI"},
    "casualty_losses": {"description": "Losses from federally declared disasters"}
  }
}', 'official'),

('US', 'credits', '{
  "child_tax_credit": {"amount": 2000, "age_limit": 17, "phaseout_start": 200000},
  "earned_income_credit": {"max_amount": 7430, "phaseout_start": 25000},
  "education_credits": {
    "american_opportunity": {"amount": 2500, "years": 4},
    "lifetime_learning": {"amount": 2000, "years": null}
  },
  "retirement_saver_credit": {"max_amount": 1000, "phaseout_start": 20000}
}', 'official'),

('CA', 'rates', '{
  "federal": {
    "2024": [
      {"bracket": 0, "rate": 0.15, "max_income": 55867},
      {"bracket": 1, "rate": 0.205, "max_income": 111733},
      {"bracket": 2, "rate": 0.26, "max_income": 173205},
      {"bracket": 3, "rate": 0.29, "max_income": 246752},
      {"bracket": 4, "rate": 0.33, "max_income": null}
    ]
  },
  "provincial": {
    "ontario": {"rate": 0.0505, "max_income": null},
    "british_columbia": {"rate": 0.0506, "max_income": null},
    "alberta": {"rate": 0.10, "max_income": null}
  }
}', 'official'),

('GB', 'rates', '{
  "income_tax": {
    "2024": [
      {"bracket": 0, "rate": 0, "max_income": 12570, "name": "Personal Allowance"},
      {"bracket": 1, "rate": 0.20, "max_income": 50270, "name": "Basic Rate"},
      {"bracket": 2, "rate": 0.40, "max_income": 125140, "name": "Higher Rate"},
      {"bracket": 3, "rate": 0.45, "max_income": null, "name": "Additional Rate"}
    ]
  },
  "national_insurance": {
    "employee": {"rate": 0.12, "max_income": 50270},
    "employer": {"rate": 0.138, "max_income": null}
  }
}', 'official');

-- Insert sample tax calendar data
INSERT INTO public.tax_calendar (country, deadline_type, deadline_date, description, is_recurring) VALUES
('US', 'filing', '2024-04-15', 'Individual Tax Return Filing Deadline', true),
('US', 'payment', '2024-04-15', 'Individual Tax Payment Deadline', true),
('US', 'extension', '2024-10-15', 'Extended Filing Deadline', true),
('US', 'quarterly', '2024-01-15', 'Q4 Estimated Tax Payment', true),
('US', 'quarterly', '2024-04-15', 'Q1 Estimated Tax Payment', true),
('US', 'quarterly', '2024-06-15', 'Q2 Estimated Tax Payment', true),
('US', 'quarterly', '2024-09-15', 'Q3 Estimated Tax Payment', true),

('CA', 'filing', '2024-04-30', 'Individual Tax Return Filing Deadline', true),
('CA', 'payment', '2024-04-30', 'Individual Tax Payment Deadline', true),
('CA', 'extension', '2024-06-15', 'Extended Filing Deadline', true),
('CA', 'quarterly', '2024-03-15', 'Q1 Estimated Tax Payment', true),
('CA', 'quarterly', '2024-06-15', 'Q2 Estimated Tax Payment', true),
('CA', 'quarterly', '2024-09-15', 'Q3 Estimated Tax Payment', true),
('CA', 'quarterly', '2024-12-15', 'Q4 Estimated Tax Payment', true),

('GB', 'filing', '2024-01-31', 'Self Assessment Tax Return Deadline', true),
('GB', 'payment', '2024-01-31', 'Self Assessment Tax Payment Deadline', true),
('GB', 'quarterly', '2024-01-31', 'Q4 VAT Return', true),
('GB', 'quarterly', '2024-04-30', 'Q1 VAT Return', true),
('GB', 'quarterly', '2024-07-31', 'Q2 VAT Return', true),
('GB', 'quarterly', '2024-10-31', 'Q3 VAT Return', true);
