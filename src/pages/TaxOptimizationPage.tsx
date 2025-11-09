import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calculator, TrendingUp, Target, Lightbulb, DollarSign, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TaxOptimizationData {
  currentTax: number;
  optimizedTax: number;
  potentialSavings: number;
  recommendations: TaxRecommendation[];
  taxBrackets: TaxBracket[];
  deductions: Deduction[];
}

interface TaxRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionRequired: string;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  current: boolean;
}

interface Deduction {
  name: string;
  amount: number;
  maxAmount: number;
  used: boolean;
  category: string;
}

const TaxOptimizationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [optimizationData, setOptimizationData] = useState<TaxOptimizationData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      // Generate tax optimization data
      const optimizationData = await generateTaxOptimization(profile);
      setOptimizationData(optimizationData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTaxOptimization = async (profile: any): Promise<TaxOptimizationData> => {
    // Simulate AI tax optimization calculations
    const annualIncome = 75000; // This would come from user's financial data
    const currentTax = calculateCurrentTax(annualIncome, profile?.filing_status || 'single');
    const optimizedTax = calculateOptimizedTax(annualIncome, profile?.filing_status || 'single');
    
    return {
      currentTax,
      optimizedTax,
      potentialSavings: currentTax - optimizedTax,
      recommendations: generateRecommendations(annualIncome, profile),
      taxBrackets: generateTaxBrackets(annualIncome, profile?.filing_status || 'single'),
      deductions: generateDeductions(annualIncome, profile)
    };
  };

  const calculateCurrentTax = (income: number, filingStatus: string): number => {
    // Simplified tax calculation - in reality, this would be more complex
    const standardDeduction = filingStatus === 'married' ? 25900 : 12950;
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    if (taxableIncome <= 10275) return taxableIncome * 0.10;
    if (taxableIncome <= 41775) return 1027.50 + (taxableIncome - 10275) * 0.12;
    if (taxableIncome <= 89450) return 4807.50 + (taxableIncome - 41775) * 0.22;
    if (taxableIncome <= 190750) return 15213.50 + (taxableIncome - 89450) * 0.24;
    if (taxableIncome <= 364200) return 34647.50 + (taxableIncome - 190750) * 0.32;
    if (taxableIncome <= 462550) return 49335.50 + (taxableIncome - 364200) * 0.35;
    return 162718 + (taxableIncome - 462550) * 0.37;
  };

  const calculateOptimizedTax = (income: number, filingStatus: string): number => {
    // Apply optimizations like retirement contributions, HSA, etc.
    const retirementContribution = Math.min(income * 0.15, 22500); // 15% or max 401k limit
    const hsaContribution = Math.min(income * 0.05, 3850); // 5% or max HSA limit
    const optimizedIncome = income - retirementContribution - hsaContribution;
    return calculateCurrentTax(optimizedIncome, filingStatus);
  };

  const generateRecommendations = (income: number, profile: any): TaxRecommendation[] => {
    return [
      {
        id: '1',
        title: 'Maximize 401(k) Contributions',
        description: 'Increase your 401(k) contributions to reduce taxable income',
        potentialSavings: 2500,
        priority: 'high',
        category: 'Retirement',
        actionRequired: 'Contact HR to increase contribution percentage'
      },
      {
        id: '2',
        title: 'Open Health Savings Account (HSA)',
        description: 'Contribute to an HSA for triple tax benefits',
        potentialSavings: 1200,
        priority: 'high',
        category: 'Healthcare',
        actionRequired: 'Open HSA account and set up automatic contributions'
      },
      {
        id: '3',
        title: 'Itemize Deductions',
        description: 'Consider itemizing if your deductions exceed the standard deduction',
        potentialSavings: 800,
        priority: 'medium',
        category: 'Deductions',
        actionRequired: 'Track all deductible expenses throughout the year'
      },
      {
        id: '4',
        title: 'Tax-Loss Harvesting',
        description: 'Sell losing investments to offset capital gains',
        potentialSavings: 400,
        priority: 'low',
        category: 'Investments',
        actionRequired: 'Review investment portfolio for loss opportunities'
      }
    ];
  };

  const generateTaxBrackets = (income: number, filingStatus: string) => {
    const brackets = [
      { min: 0, max: 10275, rate: 10 },
      { min: 10275, max: 41775, rate: 12 },
      { min: 41775, max: 89450, rate: 22 },
      { min: 89450, max: 190750, rate: 24 },
      { min: 190750, max: 364200, rate: 32 },
      { min: 364200, max: 462550, rate: 35 },
      { min: 462550, max: Infinity, rate: 37 }
    ];

    return brackets.map(bracket => ({
      ...bracket,
      current: income >= bracket.min && income <= bracket.max
    }));
  };

  const generateDeductions = (income: number, profile: any): Deduction[] => {
    return [
      { name: 'Standard Deduction', amount: 12950, maxAmount: 12950, used: true, category: 'Basic' },
      { name: '401(k) Contributions', amount: 0, maxAmount: 22500, used: false, category: 'Retirement' },
      { name: 'HSA Contributions', amount: 0, maxAmount: 3850, used: false, category: 'Healthcare' },
      { name: 'Mortgage Interest', amount: 0, maxAmount: 750000, used: false, category: 'Housing' },
      { name: 'Charitable Donations', amount: 0, maxAmount: income * 0.6, used: false, category: 'Charitable' },
      { name: 'Medical Expenses', amount: 0, maxAmount: income * 0.075, used: false, category: 'Healthcare' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Analyzing your tax situation...</p>
        </div>
      </div>
    );
  }

  if (!optimizationData) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Tax Data</h2>
          <p className="text-gray-600">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Current Tax', value: optimizationData.currentTax, color: '#ef4444' },
    { name: 'Optimized Tax', value: optimizationData.optimizedTax, color: '#10b981' }
  ];

  const COLORS = ['#1E90FF', '#4AA3FF', '#6BB5FF', '#87CEFA', '#B8DEFF'];

  return (
    <div className="min-h-screen bg-gradient-taxify">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tax Optimization</h1>
              <p className="mt-2 text-gray-600">AI-powered tax savings recommendations</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Tax</p>
                <p className="text-2xl font-bold text-red-500">${optimizationData.currentTax.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Optimized Tax</p>
                <p className="text-2xl font-bold text-green-500">${optimizationData.optimizedTax.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-gray-900">${optimizationData.potentialSavings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tax Comparison Chart */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="value" fill="#1E90FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tax Bracket Visualization */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Brackets</h3>
            <div className="space-y-2">
              {optimizationData.taxBrackets.map((bracket, index) => (
                <div key={index} className={`p-3 rounded-2xl ${bracket.current ? 'bg-[#1E90FF] text-white shadow-md' : 'bg-[#E0F0FF]/50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}
                    </span>
                    <span className="font-bold">{bracket.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

            {/* Recommendations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100/50 mb-8">
              <div className="pl-6 pr-6 py-4 border-b border-blue-100/50">
                <h3 className="text-lg font-semibold text-gray-900">AI Tax Recommendations</h3>
          </div>
              <div className="p-6">
                <div className="space-y-4">
                  {optimizationData.recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-start p-4 bg-[#E0F0FF]/50 rounded-2xl border border-blue-100/50">
                  <div className="flex-shrink-0 mr-4">
                    {rec.priority === 'high' ? (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    ) : rec.priority === 'medium' ? (
                      <Target className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Lightbulb className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          <strong>Action Required:</strong> {rec.actionRequired}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +${rec.potentialSavings.toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

            {/* Deductions Overview */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100/50">
              <div className="pl-6 pr-6 py-4 border-b border-blue-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Available Deductions</h3>
          </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationData.deductions.map((deduction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#E0F0FF]/50 rounded-2xl border border-blue-100/50">
                      <div>
                        <h4 className="font-semibold text-gray-900">{deduction.name}</h4>
                        <p className="text-sm text-gray-600">
                          Max: ${deduction.maxAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${deduction.amount.toLocaleString()}
                        </p>
                    {deduction.used ? (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded ml-auto"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxOptimizationPage;
