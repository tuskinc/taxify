import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Edit3, Trash2, Lightbulb, Target } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  spent: number;
  type: 'income' | 'expense';
  month: string;
}

const BudgetingPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets((data || []).map(item => ({
        ...item,
        type: item.type as 'income' | 'expense'
      })));
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const budgetData = {
        ...formData,
        user_id: user.id,
        spent: 0
      };

      if (editingItem) {
        const { error } = await supabase
          .from('budgets')
          .update(budgetData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert([budgetData]);
        
        if (error) throw error;
      }

      setFormData({ category: '', amount: 0, type: 'expense', month: new Date().toISOString().slice(0, 7) });
      setShowAddForm(false);
      setEditingItem(null);
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      amount: item.amount,
      type: item.type,
      month: item.month
    });
    setShowAddForm(true);
  };

  const totalIncome = budgets
    .filter(b => b.type === 'income')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalExpenses = budgets
    .filter(b => b.type === 'expense')
    .reduce((sum, b) => sum + b.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  // Chart data preparation
  const expenseData = budgets
    .filter(b => b.type === 'expense')
    .map(budget => ({
      name: budget.category,
      value: budget.amount,
      spent: budget.spent
    }));

  // const incomeData = budgets
  //   .filter(b => b.type === 'income')
  //   .map(budget => ({
  //     name: budget.category,
  //     value: budget.amount
  //   }));

  const monthlyData = budgets.reduce((acc, budget) => {
    const month = budget.month;
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    if (budget.type === 'income') {
      acc[month].income += budget.amount;
    } else {
      acc[month].expenses += budget.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // AI Suggestions based on budget analysis
  useEffect(() => {
    const suggestions: string[] = [];
    
    if (netIncome < 0) {
      suggestions.push("⚠️ You're spending more than you earn. Consider reducing expenses or increasing income.");
    }
    
    if (totalExpenses > totalIncome * 0.8) {
      suggestions.push("💡 Your expenses are high relative to income. Aim to keep expenses under 80% of income.");
    }
    
    const highExpenseCategories = expenseData.filter(item => item.value > totalExpenses * 0.3);
    if (highExpenseCategories.length > 0) {
      suggestions.push(`🎯 Consider reviewing your ${highExpenseCategories.map(c => c.name).join(', ')} expenses - they represent a large portion of your budget.`);
    }
    
    if (expenseData.length < 3) {
      suggestions.push("📊 Add more expense categories to get better insights into your spending patterns.");
    }
    
    if (totalIncome === 0) {
      suggestions.push("💰 Add your income sources to get a complete financial picture.");
    }
    
    setAiSuggestions(suggestions);
  }, [budgets, totalIncome, totalExpenses, netIncome, expenseData]);

  // Chart colors using Taxify brand
  const COLORS = ['#1E90FF', '#4AA3FF', '#6BB5FF', '#87CEFA', '#B8DEFF', '#D1E9FF', '#E0F0FF'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
              <p className="mt-2 text-gray-600">Track your income and expenses with AI insights</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Item
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">${totalIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-[#1E90FF]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="card bg-gradient-to-r from-[#1E90FF] to-[#4AA3FF] p-6 mb-8 text-white">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">AI Budget Insights</h3>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Breakdown Pie Chart */}
          {expenseData.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Income vs Expenses */}
          {monthlyChartData.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                      <Bar dataKey="income" fill="#1E90FF" name="Income" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                  required
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setFormData({ category: '', amount: 0, type: 'expense', month: new Date().toISOString().slice(0, 7) });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budget List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Budget Items</h3>
          </div>
          
          {budgets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No budget items yet. Add your first income or expense!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budgets.map((budget) => (
                    <tr key={budget.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {budget.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          budget.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {budget.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${budget.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {budget.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                              onClick={() => handleEdit(budget)}
                              className="text-[#1E90FF] hover:text-[#1C7ED6] mr-4 transition-colors duration-200"
                            >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
};

export default BudgetingPage;
