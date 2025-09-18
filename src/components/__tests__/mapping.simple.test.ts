import { describe, it, expect } from 'vitest';
import { mapToZiamTaxModel } from '../../lib/mapping';

describe('mapToZiamTaxModel', () => {
  it('maps numeric and string inputs to numbers with zeros for missing', () => {
    const raw = {
      salary_income: '1000',
      freelance_income: 200,
      property_taxes: '$300.50',
    } as Record<string, unknown>;
    const result = mapToZiamTaxModel(raw, { method: 'upload', reference: 'test' });
    expect(result.personalFinances.salary_income).toBe(1000);
    expect(result.personalFinances.freelance_income).toBe(200);
    expect(result.personalFinances.property_taxes).toBe(300.5);
    expect(result.personalFinances.mortgage_interest).toBe(0);
    expect(result.businessFinances.revenue).toBe(0);
    expect(result._source?.method).toBe('upload');
  });
});


