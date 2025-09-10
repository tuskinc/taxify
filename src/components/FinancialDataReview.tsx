import { useState } from 'react';
import type { ExtractedData } from './DocumentUpload';

type Section = 'personalFinances' | 'businessFinances';

const FIELD_LABELS = {
  personalFinances: {
    salary_income: 'Salary Income',
    freelance_income: 'Freelance Income',
    investment_income: 'Investment Income',
    rental_income: 'Rental Income',
    capital_gains: 'Capital Gains',
    retirement_contributions: 'Retirement Contributions',
    mortgage_interest: 'Mortgage Interest',
    property_taxes: 'Property Taxes',
    charitable_donations: 'Charitable Donations',
    medical_expenses: 'Medical Expenses',
    childcare_costs: 'Childcare Costs',
    education_expenses: 'Education Expenses',
    other_deductions: 'Other Deductions',
  },
  businessFinances: {
    revenue: 'Revenue',
    employee_costs: 'Employee Costs',
    equipment: 'Equipment',
    rent: 'Rent',
    utilities: 'Utilities',
    marketing: 'Marketing',
    travel_expenses: 'Travel Expenses',
    office_supplies: 'Office Supplies',
    professional_services: 'Professional Services',
    insurance: 'Insurance',
    other_expenses: 'Other Expenses',
  },
};

export default function FinancialDataReview({
  data,
  onSave,
  onBack,
}: {
  data: ExtractedData;
  onSave: (data: ExtractedData) => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState<ExtractedData>(data);

  const handleChange = (section: Section, field: keyof ExtractedData[typeof section], value: string) => {
    setFormData((prev: ExtractedData) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Number(value) || 0,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Extracted Data</h2>
        <p className="text-gray-600">Review and edit the extracted financial information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(FIELD_LABELS).map(([section, fields]) => (
          <div key={section} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
              {section.replace('Finances', ' Finances')}
            </h3>
            <div className="space-y-4">
              {Object.entries(fields).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{label}</label>
                  <div className="w-40">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        value={formData[section as Section][key as keyof ExtractedData[Section]] || 0}
                        onChange={(e) => handleChange(section as Section, key as keyof ExtractedData[Section], e.target.value)}
                        min="0"
                        step="1"
                        aria-label={`Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onSave(formData)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
