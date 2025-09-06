import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { Building2, DollarSign, Calculator, AlertCircle } from 'lucide-react'

const businessFinanceSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  annual_revenue: z.number().min(0, 'Annual revenue must be positive'),
  business_expenses: z.number().min(0, 'Business expenses cannot be negative'),
})

type BusinessFinanceFormData = z.infer<typeof businessFinanceSchema>

interface BusinessFinanceFormProps {
  userProfile: any
  onComplete: (finances: any) => void
}

export default function BusinessFinanceForm({ userProfile, onComplete }: BusinessFinanceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [formData, setFormData] = useState<BusinessFinanceFormData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BusinessFinanceFormData>({
    resolver: zodResolver(businessFinanceSchema),
    defaultValues: {
      business_name: '',
      business_type: '',
      annual_revenue: 0,
      business_expenses: 0,
    },
  })

  const watchedValues = watch()

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 's_corp', label: 'S Corporation' },
    { value: 'c_corp', label: 'C Corporation' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'other', label: 'Other' },
  ]

  const onSubmit = async (data: BusinessFinanceFormData) => {
    setFormData(data)
    setShowReview(true)
  }

  const handleConfirm = async () => {
    if (!formData) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('business_finances')
        .insert({
          user_id: userProfile.id,
          business_name: formData.business_name,
          business_type: formData.business_type,
          annual_revenue: formData.annual_revenue,
          business_expenses: formData.business_expenses,
        })

      if (error) throw error

      onComplete({
        id: userProfile.id,
        user_id: userProfile.id,
        business_name: formData.business_name,
        business_type: formData.business_type,
        annual_revenue: formData.annual_revenue,
        business_expenses: formData.business_expenses,
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

  const calculateNetIncome = () => {
    const revenue = watchedValues.annual_revenue || 0
    const expenses = watchedValues.business_expenses || 0
    return Math.max(0, revenue - expenses)
  }

  const calculateProfitMargin = () => {
    const revenue = watchedValues.annual_revenue || 0
    const netIncome = calculateNetIncome()
    return revenue > 0 ? (netIncome / revenue) * 100 : 0
  }

  if (showReview && formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Review Your Business Information
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please verify your business information before proceeding
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium">{formData.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Type:</span>
                    <span className="font-medium">
                      {businessTypes.find(type => type.value === formData.business_type)?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Annual Revenue:</span>
                      <span className="font-medium">${formData.annual_revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Business Expenses:</span>
                      <span className="font-medium">${formData.business_expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold text-gray-900">Net Income:</span>
                      <span className="font-semibold">${calculateNetIncome().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit Margin:</span>
                      <span className="font-medium">{calculateProfitMargin().toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expense Ratio:</span>
                      <span className="font-medium">
                        {formData.annual_revenue > 0 
                          ? ((formData.business_expenses / formData.annual_revenue) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Tax Analysis Preview</h3>
                <p className="text-blue-800">
                  Your business shows a{' '}
                  <span className="font-semibold">
                    {calculateNetIncome() > 0 ? 'profit' : 'loss'}
                  </span>{' '}
                  of <span className="font-semibold">${Math.abs(calculateNetIncome()).toLocaleString()}</span>.
                  This will be factored into your comprehensive tax analysis.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            Business Financial Information
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your business financial details for tax analysis
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
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('business_name')}
                    type="text"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter business name"
                  />
                </div>
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                  Business Type
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register('business_type')}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.business_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="annual_revenue" className="block text-sm font-medium text-gray-700">
                  Annual Revenue
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('annual_revenue', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.annual_revenue && (
                  <p className="mt-1 text-sm text-red-600">{errors.annual_revenue.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="business_expenses" className="block text-sm font-medium text-gray-700">
                  Business Expenses
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calculator className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('business_expenses', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                {errors.business_expenses && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_expenses.message}</p>
                )}
              </div>
            </div>

            {/* Live calculation display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Live Calculation</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Net Income:</span>
                  <span className="ml-2 font-medium">
                    ${calculateNetIncome().toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="ml-2 font-medium">
                    {calculateProfitMargin().toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
