import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { PersonalFinances } from '../App';
import { 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Home, 
  Heart, 
  GraduationCap, 
  Users,
  ArrowLeft,
  ArrowRight,
  Calculator
} from 'lucide-react';

const personalFinanceSchema = z.object({
  salary_income: z.number().min(0, 'Salary income cannot be negative'),
  freelance_income: z.number().min(0, 'Freelance income cannot be negative'),
  investment_income: z.number().min(0, 'Investment income cannot be negative'),
  rental_income: z.number().min(0, 'Rental income cannot be negative'),
  capital_gains: z.number().min(0, 'Capital gains cannot be negative'),
  retirement_contributions: z.number().min(0, 'Retirement contributions cannot be negative'),
  mortgage_interest: z.number().min(0, 'Mortgage interest cannot be negative'),
  property_taxes: z.number().min(0, 'Property taxes cannot be negative'),
  charitable_donations: z.number().min(0, 'Charitable donations cannot be negative'),
  medical_expenses: z.number().min(0, 'Medical expenses cannot be negative'),
  childcare_costs: z.number().min(0, 'Childcare costs cannot be negative'),
  education_expenses: z.number().min(0, 'Education expenses cannot be negative'),
  other_deductions: z.number().min(0, 'Other deductions cannot be negative'),
});

type PersonalFinanceFormData = z.infer<typeof personalFinanceSchema>;

interface PersonalFinanceFormProps {
  onComplete: (data: Partial<PersonalFinances>) => void;
  onBack: () => void;
}

export default function PersonalFinanceForm({ onComplete, onBack }: PersonalFinanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
  } = useForm<PersonalFinanceFormData>({
    resolver: zodResolver(personalFinanceSchema),
    mode: 'onChange',
    defaultValues: {
      salary_income: 0,
      freelance_income: 0,
      investment_income: 0,
      rental_income: 0,
      capital_gains: 0,
      retirement_contributions: 0,
      mortgage_interest: 0,
      property_taxes: 0,
      charitable_donations: 0,
      medical_expenses: 0,
      childcare_costs: 0,
      education_expenses: 0,
      other_deductions: 0,
    },
  });

  const watchedValues = watch();
  const totalIncome = watchedValues.salary_income + watchedValues.freelance_income + 
                     watchedValues.investment_income + watchedValues.rental_income + 
                     watchedValues.capital_gains;
  const totalDeductions = watchedValues.retirement_contributions + watchedValues.mortgage_interest + 
                          watchedValues.property_taxes + watchedValues.charitable_donations + 
                          watchedValues.medical_expenses + watchedValues.childcare_costs + 
                          watchedValues.education_expenses + watchedValues.other_deductions;
  const adjustedGrossIncome = totalIncome - watchedValues.retirement_contributions;

  const onSubmit = async (data: PersonalFinanceFormData) => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Save personal finances to database
      const { error: financeError } = await supabase
        .from('personal_finances')
        .insert({
          user_id: user.id,
          ...data,
        });

      if (financeError) {
        console.error('Error saving personal finances:', financeError);
        setError('Failed to save financial data');
        return;
      }

      onComplete(data);
    } catch (err) {
      console.error('Error saving personal finances:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (isValid) {
      setShowSummary(true);
    }
  };

  const handleBackToForm = () => {
    setShowSummary(false);
  };

  if (showSummary) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Review Your Financial Information</h2>
            <p className="text-gray-600">
              Please review your information before proceeding. You can go back to make changes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Income Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Income Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Salary Income:</span>
                  <span className="font-medium">${watchedValues.salary_income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freelance Income:</span>
                  <span className="font-medium">${watchedValues.freelance_income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment Income:</span>
                  <span className="font-medium">${watchedValues.investment_income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rental Income:</span>
                  <span className="font-medium">${watchedValues.rental_income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Gains:</span>
                  <span className="font-medium">${watchedValues.capital_gains.toLocaleString()}</span>
                </div>
                <hr className="border-green-200" />
                <div className="flex justify-between font-semibold text-green-800">
                  <span>Total Income:</span>
                  <span>${totalIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2" />
                Deductions Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Retirement Contributions:</span>
                  <span className="font-medium">${watchedValues.retirement_contributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mortgage Interest:</span>
                  <span className="font-medium">${watchedValues.mortgage_interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Taxes:</span>
                  <span className="font-medium">${watchedValues.property_taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Charitable Donations:</span>
                  <span className="font-medium">${watchedValues.charitable_donations.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical Expenses:</span>
                  <span className="font-medium">${watchedValues.medical_expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Childcare Costs:</span>
                  <span className="font-medium">${watchedValues.childcare_costs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Education Expenses:</span>
                  <span className="font-medium">${watchedValues.education_expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Deductions:</span>
                  <span className="font-medium">${watchedValues.other_deductions.toLocaleString()}</span>
                </div>
                <hr className="border-blue-200" />
                <div className="flex justify-between font-semibold text-blue-800">
                  <span>Total Deductions:</span>
                  <span>${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Key Tax Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                <div className="text-gray-600">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${totalDeductions.toLocaleString()}</div>
                <div className="text-gray-600">Total Deductions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${adjustedGrossIncome.toLocaleString()}</div>
                <div className="text-gray-600">Adjusted Gross Income</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg mb-4">
              <p className="text-danger-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBackToForm}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Data...
                </div>
              ) : (
                <>
                  Continue to Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Personal & Family Financial Information</h2>
          <p className="text-gray-600">
            Enter your personal income and deduction information for accurate tax analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Income Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Income Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_income" className="form-label">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Salary/Wages
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="salary_income"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('salary_income', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.salary_income && (
                  <p className="text-danger-600 text-sm mt-1">{errors.salary_income.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="freelance_income" className="form-label">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Freelance/Self-Employment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="freelance_income"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('freelance_income', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.freelance_income && (
                  <p className="text-danger-600 text-sm mt-1">{errors.freelance_income.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="investment_income" className="form-label">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Investment Income (Interest, Dividends)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="investment_income"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('investment_income', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.investment_income && (
                  <p className="text-danger-600 text-sm mt-1">{errors.investment_income.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="rental_income" className="form-label">
                  <Home className="w-4 h-4 inline mr-2" />
                  Rental Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="rental_income"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('rental_income', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.rental_income && (
                  <p className="text-danger-600 text-sm mt-1">{errors.rental_income.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="capital_gains" className="form-label">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Capital Gains
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="capital_gains"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('capital_gains', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.capital_gains && (
                  <p className="text-danger-600 text-sm mt-1">{errors.capital_gains.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Deductions & Credits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="retirement_contributions" className="form-label">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Retirement Contributions (401k, IRA)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="retirement_contributions"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('retirement_contributions', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.retirement_contributions && (
                  <p className="text-danger-600 text-sm mt-1">{errors.retirement_contributions.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="mortgage_interest" className="form-label">
                  <Home className="w-4 h-4 inline mr-2" />
                  Mortgage Interest
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="mortgage_interest"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('mortgage_interest', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.mortgage_interest && (
                  <p className="text-danger-600 text-sm mt-1">{errors.mortgage_interest.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="property_taxes" className="form-label">
                  <Home className="w-4 h-4 inline mr-2" />
                  Property Taxes
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="property_taxes"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('property_taxes', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.property_taxes && (
                  <p className="text-danger-600 text-sm mt-1">{errors.property_taxes.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="charitable_donations" className="form-label">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Charitable Donations
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="charitable_donations"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('charitable_donations', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.charitable_donations && (
                  <p className="text-danger-600 text-sm mt-1">{errors.charitable_donations.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="medical_expenses" className="form-label">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Medical Expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="medical_expenses"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('medical_expenses', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.medical_expenses && (
                  <p className="text-danger-600 text-sm mt-1">{errors.medical_expenses.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="childcare_costs" className="form-label">
                  <Users className="w-4 h-4 inline mr-2" />
                  Childcare Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="childcare_costs"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('childcare_costs', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.childcare_costs && (
                  <p className="text-danger-600 text-sm mt-1">{errors.childcare_costs.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="education_expenses" className="form-label">
                  <GraduationCap className="w-4 h-4 inline mr-2" />
                  Education Expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="education_expenses"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('education_expenses', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.education_expenses && (
                  <p className="text-danger-600 text-sm mt-1">{errors.education_expenses.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="other_deductions" className="form-label">
                  <Calculator className="w-4 h-4 inline mr-2" />
                  Other Deductions
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="other_deductions"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('other_deductions', { valueAsNumber: true })}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
                {errors.other_deductions && (
                  <p className="text-danger-600 text-sm mt-1">{errors.other_deductions.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                <div className="text-gray-600">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">${totalDeductions.toLocaleString()}</div>
                <div className="text-gray-600">Total Deductions</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">${adjustedGrossIncome.toLocaleString()}</div>
                <div className="text-gray-600">AGI</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!isValid}
              className="btn-primary"
            >
              Review & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
