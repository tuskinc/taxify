import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../App';
import { Calendar, Users, DollarSign, MapPin } from 'lucide-react';

const profileSchema = z.object({
  country: z.string().min(1, 'Please select a country'),
  filing_status: z.enum(['single', 'married_joint', 'married_separate', 'head_of_household'], {
    required_error: 'Please select your filing status'
  }),
  birth_date: z.string().min(1, 'Please enter your birth date'),
  dependents: z.number().min(0, 'Dependents cannot be negative').max(10, 'Maximum 10 dependents'),
  spouse_income: z.number().min(0, 'Spouse income cannot be negative'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
];

const filingStatuses = [
  { value: 'single', label: 'Single', description: 'Filing as an individual' },
  { value: 'married_joint', label: 'Married Filing Jointly', description: 'Filing together with spouse' },
  { value: 'married_separate', label: 'Married Filing Separately', description: 'Filing separately from spouse' },
  { value: 'head_of_household', label: 'Head of Household', description: 'Single with qualifying dependents' },
];

export default function UserProfileSetup({ onComplete }: UserProfileSetupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  });

  const watchedFilingStatus = watch('filing_status');
  const showSpouseIncome = watchedFilingStatus === 'married_joint' || watchedFilingStatus === 'married_separate';

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // First, create or update the user record
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          country: data.country,
          filing_status: data.filing_status,
          tax_scenarios: ['personal'], // Default to personal
        });

      if (userError) {
        console.error('Error creating user:', userError);
        setError('Failed to create user profile');
        return;
      }

      // Then create the user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          birth_date: data.birth_date,
          dependents: data.dependents,
          spouse_income: data.spouse_income,
          filing_status: data.filing_status,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Failed to create user profile');
        return;
      }

      onComplete(profileData);
    } catch (err) {
      console.error('Error in profile setup:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Complete Your Profile</h2>
          <p className="text-gray-600">
            Help us provide personalized tax analysis by completing your profile information.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Country Selection */}
          <div>
            <label htmlFor="country" className="form-label">
              <MapPin className="w-4 h-4 inline mr-2" />
              Tax Residence Country
            </label>
            <select
              id="country"
              {...register('country')}
              className="form-input"
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-danger-600 text-sm mt-1">{errors.country.message}</p>
            )}
          </div>

          {/* Filing Status */}
          <div>
            <label className="form-label">Filing Status</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filingStatuses.map((status) => (
                <label
                  key={status.value}
                  className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <input
                    type="radio"
                    value={status.value}
                    {...register('filing_status')}
                    className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{status.label}</div>
                    <div className="text-sm text-gray-500">{status.description}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.filing_status && (
              <p className="text-danger-600 text-sm mt-1">{errors.filing_status.message}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="birth_date" className="form-label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date of Birth
            </label>
            <input
              id="birth_date"
              type="date"
              {...register('birth_date')}
              className="form-input"
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.birth_date && (
              <p className="text-danger-600 text-sm mt-1">{errors.birth_date.message}</p>
            )}
          </div>

          {/* Dependents */}
          <div>
            <label htmlFor="dependents" className="form-label">
              <Users className="w-4 h-4 inline mr-2" />
              Number of Dependents
            </label>
            <input
              id="dependents"
              type="number"
              min="0"
              max="10"
              {...register('dependents', { valueAsNumber: true })}
              className="form-input"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Include children, elderly parents, or other qualifying dependents
            </p>
            {errors.dependents && (
              <p className="text-danger-600 text-sm mt-1">{errors.dependents.message}</p>
            )}
          </div>

          {/* Spouse Income - Conditional */}
          {showSpouseIncome && (
            <div>
              <label htmlFor="spouse_income" className="form-label">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Spouse's Annual Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="spouse_income"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('spouse_income', { valueAsNumber: true })}
                  className="form-input pl-8"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Enter 0 if your spouse has no income
              </p>
              {errors.spouse_income && (
                <p className="text-danger-600 text-sm mt-1">{errors.spouse_income.message}</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Profile...
                </div>
              ) : (
                'Continue to Tax Scenario Selection'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          This information helps us provide accurate tax calculations and recommendations.
          <br />
          You can update these details later in your profile settings.
        </p>
      </div>
    </div>
  );
}
