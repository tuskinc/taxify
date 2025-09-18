import type { ZiamTaxModel, RawExtractedData, TaxPersonalFinances, TaxBusinessFinances } from './taxModel';

function numberOrZero(value: unknown): number {
  const num = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function buildPersonal(data: RawExtractedData): TaxPersonalFinances {
  return {
    salary_income: numberOrZero(data.salary_income),
    freelance_income: numberOrZero(data.freelance_income),
    investment_income: numberOrZero(data.investment_income),
    rental_income: numberOrZero(data.rental_income),
    capital_gains: numberOrZero(data.capital_gains),
    retirement_contributions: numberOrZero(data.retirement_contributions),
    mortgage_interest: numberOrZero(data.mortgage_interest),
    property_taxes: numberOrZero(data.property_taxes),
    charitable_donations: numberOrZero(data.charitable_donations),
    medical_expenses: numberOrZero(data.medical_expenses),
    childcare_costs: numberOrZero(data.childcare_costs),
    education_expenses: numberOrZero(data.education_expenses),
    other_deductions: numberOrZero(data.other_deductions),
  };
}

function buildBusiness(data: RawExtractedData): TaxBusinessFinances {
  return {
    revenue: numberOrZero(data.revenue),
    employee_costs: numberOrZero(data.employee_costs),
    equipment: numberOrZero(data.equipment),
    rent: numberOrZero(data.rent),
    utilities: numberOrZero(data.utilities),
    marketing: numberOrZero(data.marketing),
    travel_expenses: numberOrZero(data.travel_expenses),
    office_supplies: numberOrZero(data.office_supplies),
    professional_services: numberOrZero(data.professional_services),
    insurance: numberOrZero(data.insurance),
    other_expenses: numberOrZero(data.other_expenses),
  };
}

export function mapToZiamTaxModel(raw: RawExtractedData, source?: ZiamTaxModel['_source']): ZiamTaxModel {
  return {
    personalFinances: buildPersonal(raw),
    businessFinances: buildBusiness(raw),
    _source: source,
  };
}


