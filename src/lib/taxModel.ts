export interface TaxPersonalFinances {
  salary_income: number;
  freelance_income: number;
  investment_income: number;
  rental_income: number;
  capital_gains: number;
  retirement_contributions: number;
  mortgage_interest: number;
  property_taxes: number;
  charitable_donations: number;
  medical_expenses: number;
  childcare_costs: number;
  education_expenses: number;
  other_deductions: number;
}

export interface TaxBusinessFinances {
  revenue: number;
  employee_costs: number;
  equipment: number;
  rent: number;
  utilities: number;
  marketing: number;
  travel_expenses: number;
  office_supplies: number;
  professional_services: number;
  insurance: number;
  other_expenses: number;
}

export interface ZiamTaxModel {
  personalFinances: TaxPersonalFinances;
  businessFinances: TaxBusinessFinances;
  // Optional provenance to track source and identifiers per field
  _source?: {
    method: 'upload' | 'ocr' | 'crm';
    reference?: string; // file id, image id, or crm sync id
    provider?: string; // e.g. quickbooks, xero
  };
}

export type RawExtractedData = Record<string, unknown>;


