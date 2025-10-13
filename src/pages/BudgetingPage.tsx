import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
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
  ResponsiveContainer
} from 'recharts'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Brain
} from 'lucide-react'

interface BudgetTransaction {
  id: string
  user_id: string
  category: string
  amount: number
  type: 'income' | 'expense'
  date: string
  notes: string
  created_at: string
}

interface BudgetSummary {
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  monthlyTrend: number
  topCategory: string
  budgetUtilization: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

const CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Entertainment', 
  'Healthcare', 'Education', 'Shopping', 'Utilities', 'Other'
]

// TypeScript interfaces
interface User {
  id: string
  email?: string
  [key: string]: any // Allow for additional Supabase user properties
}

export default function BudgetingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [aiInsights, setAiInsights] = useState<string>('')
  const [loadingInsights, setLoadingInsights] = useState(false)
  const navigate = useNavigate()

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    category: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const loadTransactions = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/financial-data?user_id=${user.id}&type=budgets`)
      const result = await response.json()
      
      if (result.success) {
        setTransactions(result.data ?? [])
        calculateSummary(result.data ?? [])
      } else {
        throw new Error(result.error ?? 'Failed to load transactions')
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (!session?.user) {
          navigate('/login')
          return
        }
        await loadTransactions(session.user.id)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        if (!isMounted) return
        setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    void init()
    return () => { isMounted = false }
  }, [navigate])

  // -----------------------------------------------------------------

 const loadTransactions = async (userId?: string) => {
    try {
     const response = await fetch(
       `/api/financial-data?user_id=${userId ?? user?.id}&type=budgets`
     )
      // ...rest of implementation
    } catch (error) {
      // error handling
    }
  }
  const calculateSummary = (transactions: BudgetTransaction[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const savings = income - expenses

    // Calculate category breakdown
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

    setSummary({
      totalIncome: income,
      totalExpenses: expenses,
      totalSavings: savings,
      monthlyTrend: 0, // TODO: Calculate trend
      topCategory,
      budgetUtilization: expenses / (income || 1) * 100
    })
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amount = parseFloat(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount')
      return
    }

    try {
      const response = await fetch('/api/financial-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'budget',
          user_id: user.id,
          data: {
            category: newTransaction.category,
            amount,
            type: newTransaction.type,
            date: newTransaction.date,
            notes: newTransaction.notes
          }
        })
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      setNewTransaction({
        category: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setShowAddTransaction(false)
      await loadTransactions()
    } catch (error) {
      console.error('Failed to add transaction:', error)
      alert('Failed to add transaction. Please try again.')
    }
  }      setShowAddTransaction(false)
      await loadTransactions()
    } catch (error) {
      console.error('Failed to add transaction:', error)
      alert('Failed to add transaction. Please try again.')
    }
  }
  const generateAIInsights = async () => {
    setLoadingInsights(true)
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          insight_type: 'budget'
        })
      })

      const result = await response.json()
      if (result.success && result.data?.insights) {
        const insights = result.data.insights as Array<{
          title: string
          priority: string
          description: string
          recommendation: string
          impact: string
        }>
        const formattedInsights = insights.map((insight) => 
          `${insight.title} (${insight.priority.toUpperCase()} PRIORITY)\n${insight.description}\n\nRecommendation: ${insight.recommendation}\nImpact: ${insight.impact}\n`
        ).join('\n---\n\n')
        
        setAiInsights(formattedInsights)
      } else {
        throw new Error(result.error ?? 'Failed to generate insights')
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
      setAiInsights('Unable to generate AI insights at this time. Please try again later.')
    } finally {
      setLoadingInsights(false)
    }
  }

  const getChartData = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount
    }))
  }

  const getMonthlyData = () => {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).getMonth()
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0, month: month + 1 }
      }
      if (t.type === 'income') {
        acc[month].income += t.amount
      } else {
        acc[month].expenses += t.amount
      }
      return acc
    }, {} as Record<number, { income: number; expenses: number; month: number }>)

    return Object.values(monthlyData).sort((a, b) => a.month - b.month)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  const chartData = getChartData()
  const monthlyData = getMonthlyData()

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budgeting Dashboard</h1>
            <p className="text-gray-600">Track your income, expenses, and savings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => { setShowAddTransaction(true) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
            <button
              onClick={() => { void generateAIInsights() }}
              disabled={loadingInsights}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loadingInsights ? 'Analyzing...' : 'AI Insights'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">${summary?.totalIncome.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${summary?.totalExpenses.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">${summary?.totalSavings.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Budget Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.budgetUtilization.toFixed(1) || '0'}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expense Breakdown Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No expense data available
              </div>
            )}
          </div>

          {/* Monthly Trends Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No monthly data available
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Financial Insights
            </h3>
            <div className="text-gray-700 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Transaction</h3>
              <form onSubmit={handleAddTransaction}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      aria-label="Transaction category"
                      title="Select transaction category"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      aria-label="Transaction type"
                      title="Select transaction type"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      aria-label="Transaction amount"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                      aria-label="Transaction date"
                      title="Select transaction date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newTransaction.notes}
                      onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      aria-label="Transaction notes"
                      placeholder="Enter notes (optional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowAddTransaction(false) }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { navigate('/dashboard') }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}          </button>
        </div>
      </div>
    </div>
  )
}