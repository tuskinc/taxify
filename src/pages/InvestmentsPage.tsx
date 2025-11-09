import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TrendingUp, PieChart, BarChart3, Plus, Edit3, Trash2, DollarSign, Lightbulb, Target } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
  user_id: string;
}

const InvestmentsPage: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks',
    amount: 0,
    current_value: 0,
    purchase_date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments((data || []).map(item => ({
        ...item,
        name: item.name || '',
        type: item.type || 'stocks',
        amount: item.amount || 0,
        current_value: item.current_value || 0,
        purchase_date: item.purchase_date || new Date().toISOString().slice(0, 10)
      })));
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const investmentData = {
        ...formData,
        user_id: user.id
      };

      if (editingInvestment) {
        const { error } = await supabase
          .from('investments')
          .update(investmentData)
          .eq('id', editingInvestment.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investments')
          .insert([investmentData]);
        
        if (error) throw error;
      }

      setFormData({ name: '', type: 'stocks', amount: 0, current_value: 0, purchase_date: new Date().toISOString().slice(0, 10) });
      setShowAddForm(false);
      setEditingInvestment(null);
      loadInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      amount: investment.amount,
      current_value: investment.current_value,
      purchase_date: investment.purchase_date
    });
    setShowAddForm(true);
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const investmentTypes = ['stocks', 'bonds', 'mutual_funds', 'etf', 'real_estate', 'crypto', 'other'];

  // Chart data preparation
  const portfolioAllocation = investments.reduce((acc, investment) => {
    const type = investment.type;
    if (!acc[type]) {
      acc[type] = { type, value: 0, count: 0 };
    }
    acc[type].value += investment.current_value;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { type: string; value: number; count: number }>);

  const portfolioData = Object.values(portfolioAllocation).map(item => ({
    name: item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.value,
    count: item.count
  }));

  const performanceData = investments.map(investment => {
    const gainLoss = investment.current_value - investment.amount;
    const gainLossPercent = investment.amount > 0 ? (gainLoss / investment.amount) * 100 : 0;
    return {
      name: investment.name,
      invested: investment.amount,
      current: investment.current_value,
      gainLoss: gainLoss,
      gainLossPercent: gainLossPercent,
      type: investment.type
    };
  });

  // AI Investment Recommendations
  useEffect(() => {
    const recommendations: string[] = [];
    
    if (investments.length === 0) {
      recommendations.push("💡 Start your investment journey! Consider low-cost index funds for diversification.");
      recommendations.push("📈 Begin with a mix of stocks and bonds based on your risk tolerance.");
    } else {
      // Check portfolio diversification
      const typeCount = new Set(investments.map(inv => inv.type)).size;
      if (typeCount < 3) {
        recommendations.push("🎯 Diversify your portfolio! Consider adding different asset types like bonds or ETFs.");
      }
      
      // Check for high-risk concentration
      const stockPercentage = portfolioData.find(p => p.name.toLowerCase().includes('stock'))?.value || 0;
      const totalValue = portfolioData.reduce((sum, p) => sum + p.value, 0);
      if (totalValue > 0 && (stockPercentage / totalValue) > 0.8) {
        recommendations.push("⚖️ Your portfolio is heavily weighted in stocks. Consider adding bonds for stability.");
      }
      
      // Check for underperforming investments
      const underperforming = investments.filter(inv => {
        const gainLoss = inv.current_value - inv.amount;
        const gainLossPercent = inv.amount > 0 ? (gainLoss / inv.amount) * 100 : 0;
        return gainLossPercent < -10; // 10% loss threshold
      });
      
      if (underperforming.length > 0) {
        recommendations.push(`⚠️ Review your ${underperforming.map(inv => inv.name).join(', ')} investments - they're underperforming.`);
      }
      
      // Check for recent investments
      const recentInvestments = investments.filter(inv => {
        const purchaseDate = new Date(inv.purchase_date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return purchaseDate > sixMonthsAgo;
      });
      
      if (recentInvestments.length === 0) {
        recommendations.push("📅 Consider adding new investments to keep your portfolio active and growing.");
      }
      
      // Check portfolio size
      if (totalValue < 10000) {
        recommendations.push("💰 Consider increasing your investment amounts gradually to build wealth over time.");
      }
    }
    
    setAiRecommendations(recommendations);
  }, [investments, portfolioData]);

  // Chart colors using Taxify brand
  const COLORS = ['#1E90FF', '#4AA3FF', '#6BB5FF', '#87CEFA', '#B8DEFF', '#D1E9FF', '#E0F0FF', '#F59E0B', '#EF4444', '#10B981'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-taxify">
      <div className="max-w-7xl mx-auto pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
          <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
              <p className="mt-2 text-gray-600">Track your investments and performance with AI insights</p>
          </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">${totalInvested.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-green-500">${totalCurrentValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${totalGainLoss.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
                <div className="flex items-center">
                  <PieChart className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Return %</p>
                <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <div className="bg-gradient-to-r from-[#1E90FF] to-[#4AA3FF] p-6 rounded-2xl mb-8 text-white shadow-md">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">AI Investment Insights</h3>
            </div>
            <div className="space-y-2">
              {aiRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Portfolio Allocation Pie Chart */}
              {portfolioData.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                </RechartsPieChart>
              </ResponsiveContainer>
              </div>
            )}

              {/* Investment Performance Bar Chart */}
              {performanceData.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                      <Bar dataKey="invested" fill="#1E90FF" name="Invested" />
                      <Bar dataKey="current" fill="#4AA3FF" name="Current Value" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-blue-100/50 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingInvestment ? 'Edit Investment' : 'Add Investment'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Investment Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {investmentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Invested</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
        </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
        </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingInvestment(null);
                    setFormData({ name: '', type: 'stocks', amount: 0, current_value: 0, purchase_date: new Date().toISOString().slice(0, 10) });
                  }}
                  className="pl-4 pr-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                  {editingInvestment ? 'Update' : 'Add'} Investment
                </button>
              </div>
            </form>
          </div>
        )}

            {/* Investments List */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-blue-100/50">
              <div className="pl-6 pr-6 py-4 border-b border-blue-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Your Investments</h3>
          </div>
          
          {investments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No investments yet. Add your first investment to get started!</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {investments.map((investment) => {
                    const gainLoss = investment.current_value - investment.amount;
                    const gainLossPercent = investment.amount > 0 ? (gainLoss / investment.amount) * 100 : 0;
                    
                    return (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {investment.name}
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {investment.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${investment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${investment.current_value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${gainLoss.toLocaleString()}
                            </span>
                            <span className={`text-xs ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {gainLossPercent.toFixed(2)}%
                      </span>
                          </div>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEdit(investment)}
                                className="text-[#1E90FF] hover:text-[#1C7ED6] mr-4 transition-colors duration-200"
                              >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                    </td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentsPage;