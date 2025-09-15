import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { DollarSign, Calculator, AlertCircle } from 'lucide-react'

const personalFinanceSchema = z.object({
  annual_income: z.number().min(0, 'Annual income must be positive'),
  deductions: z.number().min(0, 'Deductions cannot be negative'),
  credits: z.number().min(0, 'Credits cannot be negative'),
  other_income: z.number().min(0, 'Other income cannot be negative'),
})

type PersonalFinanceFormData = z.infer<typeof personalFinanceSchema>

interface PersonalFinanceFormProps {
  userProfile: any
  onComplete: (finances: any) => void
}

export default function PersonalFinanceForm({ userProfile, onComplete }: PersonalFinanceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [formData, setFormData] = useState<PersonalFinanceFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PersonalFinanceFormData>({
    resolver: zodResolver(personalFinanceSchema),
    defaultValues: {
      annual_income: 0,
      deductions: 0,
      credits: 0,
      other_income: 0,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: PersonalFinanceFormData) => {
    setFormData(data)
    setShowReview(true)
  }

  const handleConfirm = async () => {
    if (!formData) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('personal_finances')
        .insert({
          user_id: userProfile.id,
          annual_income: formData.annual_income,
          deductions: formData.deductions,
          credits: formData.credits,
          other_income: formData.other_income,
        })

      if (error) throw error

      onComplete({
        id: userProfile.id,
        user_id: userProfile.id,
        annual_income: formData.annual_income,
        deductions: formData.deductions,
        credits: formData.credits,
        other_income: formData.other_income,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setShowReview(false)
    setFormData(null)
  }

  const calculateTaxableIncome = () => {
    const totalIncome = (watchedValues.annual_income || 0) + (watchedValues.other_income || 0)
    const totalDeductions = watchedValues.deductions || 0
    return Math.max(0, totalIncome - totalDeductions)
  }

  // const calculateNetIncome = () => {
  //   const taxableIncome = calculateTaxableIncome()
  //   const totalCredits = watchedValues.credits || 0
  //   return Math.max(0, taxableIncome - totalCredits)
  // }

  if (showReview && formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Review Your Financial Information
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please verify your information before proceeding
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            {error && (
              <div className="mb-6 flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Income:</span>
                      <span className="font-medium">${formData.annual_income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Income:</span>
                      <span className="font-medium">${formData.other_income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Total Income:</span>
                      <span className="font-semibold">${(formData.annual_income + formData.other_income).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions & Credits</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deductions:</span>
                      <span className="font-medium">${formData.deductions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">${formData.credits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Taxable Income:</span>
                      <span className="font-semibold">${calculateTaxableIncome().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Tax Estimate</h3>
                <p className="text-blue-800">
                  Based on your information, your estimated taxable income is{' '}
                  <span className="font-semibold">${calculateTaxableIncome().toLocaleString()}</span>.
                  This will be used for tax calculations in your analysis.
                </p>
              </div>

              <div className="flex" style={{ gap: 12 }}>
                <button
                  onClick={handleBack}
                  className="flex-1 btn btn-secondary"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Confirm & Continue'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Personal Financial Information
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your personal financial details for tax analysis
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="annual_income" className="block text-sm font-medium text-gray-700">
                  Annual Income
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('annual_income', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.annual_income && (
                  <p className="mt-1 text-sm text-red-600">{errors.annual_income.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="other_income" className="block text-sm font-medium text-gray-700">
                  Other Income
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('other_income', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.other_income && (
                  <p className="mt-1 text-sm text-red-600">{errors.other_income.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="deductions" className="block text-sm font-medium text-gray-700">
                  Total Deductions
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calculator className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('deductions', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.deductions && (
                  <p className="mt-1 text-sm text-red-600">{errors.deductions.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                  Total Tax Credits
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calculator className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('credits', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.credits && (
                  <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
                )}
              </div>
            </div>

            {/* Live calculation display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Live Calculation</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Income:</span>
                  <span className="ml-2 font-medium">
                    ${((watchedValues.annual_income || 0) + (watchedValues.other_income || 0)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Taxable Income:</span>
                  <span className="ml-2 font-medium">
                    ${calculateTaxableIncome().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-24px">
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Review Information
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
