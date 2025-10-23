import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { taxOptimizationMCP, TaxOptimizationResult } from '../lib/tax-optimization-mcp';
import { supabase } from '../lib/supabase';

const TaxOptimizationPage: React.FC = () => {
  const [optimizationData, setOptimizationData] = useState<TaxOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadOptimizationData(user.id);
      }
    };
    getUser();
  }, []);

  const loadOptimizationData = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await taxOptimizationMCP.getLatestOptimization(userId);
      if (data) {
        setOptimizationData(data);
      } else {
        // If no existing optimization, create a new one
        await processNewOptimization(userId);
      }
    } catch (err) {
      console.error('Failed to load optimization data:', err);
      setError('Failed to load tax optimization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processNewOptimization = async (userId: string) => {
    try {
      const result = await taxOptimizationMCP.processTaxOptimization(userId);
      if (result) {
        setOptimizationData(result);
      } else {
        setError('Unable to generate tax optimization. Please check your financial data.');
      }
    } catch (err) {
      console.error('Failed to process optimization:', err);
      setError('Failed to process tax optimization. Please try again.');
    }
  };

  const handleRefresh = async () => {
    if (!userId) return;
    
    setRefreshing(true);
    try {
      await processNewOptimization(userId);
    } catch (err) {
      console.error('Failed to refresh optimization:', err);
      setError('Failed to refresh tax optimization. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!optimizationData) return;

    const reportContent = `
Taxify AI Tax Optimization Report
Generated: ${new Date().toLocaleDateString()}

Current Tax Liability: $${optimizationData.current_tax.toLocaleString()}
Optimized Tax Liability: $${optimizationData.optimized_tax.toLocaleString()}
Potential Savings: $${optimizationData.potential_savings.toLocaleString()}

Tax Bracket: ${optimizationData.analysis_data.tax_bracket}
Effective Rate: ${optimizationData.analysis_data.effective_rate}%
Marginal Rate: ${optimizationData.analysis_data.marginal_rate * 100}%

Recommendations:
${optimizationData.recommendations.map(rec => `• ${rec}`).join('\n')}

Optimization Strategies:
${optimizationData.analysis_data.optimization_strategies.map(strategy => `• ${strategy}`).join('\n')}

Tax Suggestions:
${optimizationData.suggestions.map(suggestion => 
  `• ${suggestion.title}: ${suggestion.description} (Potential Savings: $${suggestion.potential_savings.toLocaleString()})`
).join('\n')}

This report was generated using AI-powered tax optimization to help maximize your tax savings.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Taxify_Tax_Optimization_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!optimizationData) return;

    const shareData = {
      title: 'Taxify Tax Optimization Results',
      text: `I saved $${optimizationData.potential_savings.toLocaleString()} with Taxify's AI tax optimization!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.text);
      alert('Results copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Analyzing your tax situation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Optimization Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => userId && loadOptimizationData(userId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!optimizationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Optimization Data</h2>
          <p className="text-gray-600 mb-4">We couldn't find any tax optimization data for your account.</p>
          <button
            onClick={() => userId && processNewOptimization(userId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Optimization
          </button>
        </div>
      </div>
    );
  }

  const pieData = optimizationData.chart_data.tax_breakdown || [
    { name: 'Federal Tax', value: optimizationData.optimized_tax * 0.8, color: '#8884d8' },
    { name: 'State Tax', value: optimizationData.optimized_tax * 0.2, color: '#82ca9d' }
  ];

  const barData = optimizationData.chart_data.before_after || [
    { category: 'Current Tax', before: optimizationData.current_tax, after: optimizationData.current_tax },
    { category: 'Optimized Tax', before: optimizationData.current_tax, after: optimizationData.optimized_tax },
    { category: 'Savings', before: 0, after: optimizationData.potential_savings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tax Optimization</h1>
              <p className="text-gray-600 mt-2">AI-powered tax savings analysis and recommendations</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">✅ Your tax plan has been optimized!</h3>
              <p className="text-green-700">
                You could save <span className="font-bold">${optimizationData.potential_savings.toLocaleString()}</span> with our AI recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Tax</p>
                <p className="text-2xl font-bold text-gray-900">${optimizationData.current_tax.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Optimized Tax</p>
                <p className="text-2xl font-bold text-gray-900">${optimizationData.optimized_tax.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-gray-900">${optimizationData.potential_savings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tax Breakdown Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Before/After Comparison Bar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Before vs After</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="before" fill="#ef4444" name="Before Optimization" />
                <Bar dataKey="after" fill="#10b981" name="After Optimization" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Data */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Tax Bracket</p>
              <p className="text-xl font-bold text-gray-900">{optimizationData.analysis_data.tax_bracket}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Effective Rate</p>
              <p className="text-xl font-bold text-gray-900">{optimizationData.analysis_data.effective_rate}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Marginal Rate</p>
              <p className="text-xl font-bold text-gray-900">{(optimizationData.analysis_data.marginal_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {optimizationData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Suggestions */}
        {optimizationData.suggestions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Tax Suggestions</h3>
            <div className="space-y-4">
              {optimizationData.suggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                      <p className="text-gray-600 mt-1">{suggestion.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Potential Savings: <span className="font-semibold text-green-600">${suggestion.potential_savings.toLocaleString()}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Difficulty: <span className="font-semibold">{suggestion.difficulty}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Time: <span className="font-semibold">{suggestion.time_to_implement}</span>
                        </span>
                      </div>
                    </div>
                    {suggestion.actionable && (
                      <button className="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Take Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxOptimizationPage;
