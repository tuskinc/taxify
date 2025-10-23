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
  DollarSign, 
  Target, 
  Brain,
  BarChart3
} from 'lucide-react'

interface Investment {
  id: string
  user_id: string
  asset_type: string
  amount_invested: number
  current_value: number
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
  symbol?: string
  purchase_date?: string
}

interface PortfolioSummary {
  totalInvested: number
  totalValue: number
  totalReturns: number
  roiPercentage: number
  bestPerformer: string
  worstPerformer: string
  riskDistribution: Record<string, number>
  monthlyReturns: number[]
}

const RISK_COLORS = {
  low: '#10B981',
  medium: '#F59E0B', 
  high: '#EF4444'
}

const ASSET_TYPES = [
  'Stocks', 'Bonds', 'ETFs', 'Mutual Funds', 'Crypto', 'Real Estate', 'Commodities', 'Other'
]

export default function InvestmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [showAddInvestment, setShowAddInvestment] = useState(false)
  const [aiInsights, setAiInsights] = useState<string>('')
  const [loadingInsights, setLoadingInsights] = useState(false)
  const navigate = useNavigate()

  // New investment form state
  const [newInvestment, setNewInvestment] = useState({
    asset_type: '',
    amount_invested: '',
    current_value: '',
    risk_level: 'medium' as 'low' | 'medium' | 'high',
    symbol: '',
    purchase_date: new Date().toISOString().split('T')[0]
  })

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
        // pass the session user directly to avoid race on state
        await loadInvestments()
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

  const loadInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('business_finances')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map business_finances data to Investment format
      const mappedInvestments = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        asset_type: item.business_type,
        amount_invested: item.business_expenses || 0,
        current_value: item.annual_revenue || 0,
        risk_level: 'medium' as 'low' | 'medium' | 'high',
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
      
      setInvestments(mappedInvestments)
      calculateSummary(mappedInvestments)
    } catch (error) {
      console.error('Failed to load investments:', error)
    }
  }

  const calculateSummary = (investments: Investment[]) => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount_invested, 0)
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)
    const totalReturns = totalValue - totalInvested
    const roiPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

    // Find best and worst performers
    const performers = investments.map(inv => ({
      symbol: inv.symbol || inv.asset_type,
      returns: inv.current_value - inv.amount_invested
    })).sort((a, b) => b.returns - a.returns)

    const bestPerformer = performers[0]?.symbol || 'None'
    const worstPerformer = performers[performers.length - 1]?.symbol || 'None'

    // Risk distribution
    const riskDistribution = investments.reduce((acc, inv) => {
      acc[inv.risk_level] = (acc[inv.risk_level] || 0) + inv.current_value
      return acc
    }, {} as Record<string, number>)

    // Mock monthly returns for demonstration
    const monthlyReturns = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      returns: Math.random() * 10 - 5, // Random returns between -5% and 5%
      value: totalValue * (1 + (Math.random() * 0.2 - 0.1)) // Simulate portfolio value changes
    }))

    setSummary({
      totalInvested,
      totalValue,
      totalReturns,
      roiPercentage,
      bestPerformer,
      worstPerformer,
      riskDistribution,
      monthlyReturns: monthlyReturns.map(m => m.returns)
    })
  }

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('business_finances')
        .insert({
          user_id: user.id,
          business_name: newInvestment.asset_type,
          business_type: newInvestment.asset_type,
          business_expenses: parseFloat(newInvestment.amount_invested),
          annual_revenue: parseFloat(newInvestment.current_value),
          symbol: newInvestment.symbol || null,
          purchase_date: newInvestment.purchase_date || null
        })

      if (error) throw error

      setNewInvestment({
        asset_type: '',
        amount_invested: '',
        current_value: '',
        risk_level: 'medium' as 'low' | 'medium' | 'high',
        symbol: '',
        purchase_date: new Date().toISOString().split('T')[0]
      })
      setShowAddInvestment(false)
      await loadInvestments()
    } catch (error) {
      console.error('Failed to add investment:', error)
    }
  }

  const generateAIInsights = async () => {
    setLoadingInsights(true)
    try {
      // Generate basic insights based on portfolio data
      const insights = []
      
      if (summary) {
        if (summary.roiPercentage > 10) {
          insights.push({
            title: 'Strong Portfolio Performance',
            priority: 'high',
            description: `Your portfolio is performing well with a ${summary.roiPercentage.toFixed(1)}% ROI.`,
            recommendation: 'Consider rebalancing to maintain this performance.',
            impact: 'Positive impact on long-term wealth building.'
          })
        } else if (summary.roiPercentage < -5) {
          insights.push({
            title: 'Portfolio Underperformance',
            priority: 'high',
            description: `Your portfolio is underperforming with a ${summary.roiPercentage.toFixed(1)}% ROI.`,
            recommendation: 'Review your investment strategy and consider diversification.',
            impact: 'May require immediate attention to prevent further losses.'
          })
        }

        if (summary.totalValue > summary.totalInvested * 1.2) {
          insights.push({
            title: 'Excellent Growth',
            priority: 'medium',
            description: 'Your investments have grown significantly.',
            recommendation: 'Consider taking some profits or rebalancing.',
            impact: 'Good opportunity to secure gains.'
          })
        }

        const riskDistribution = summary.riskDistribution
        const highRiskPercentage = (riskDistribution.high || 0) / summary.totalValue * 100
        if (highRiskPercentage > 50) {
          insights.push({
            title: 'High Risk Concentration',
            priority: 'medium',
            description: 'Your portfolio has a high concentration of risky investments.',
            recommendation: 'Consider diversifying with lower-risk assets.',
            impact: 'Reducing risk exposure could improve stability.'
          })
        }
      }

      if (insights.length === 0) {
        insights.push({
          title: 'Portfolio Analysis',
          priority: 'low',
          description: 'Your portfolio appears to be well-balanced.',
          recommendation: 'Continue monitoring and adjusting as needed.',
          impact: 'Maintaining current strategy seems appropriate.'
        })
      }

      const formattedInsights = insights.map(insight => 
        `${insight.title} (${insight.priority.toUpperCase()} PRIORITY)\n${insight.description}\n\nRecommendation: ${insight.recommendation}\nImpact: ${insight.impact}\n`
      ).join('\n---\n\n')
      
      setAiInsights(formattedInsights)
    } catch (error) {
      console.error('Failed to generate insights:', error)
      setAiInsights('Unable to generate AI insights at this time. Please try again later.')
    } finally {
      setLoadingInsights(false)
    }
  }

  const getAssetTypeData = () => {
    const assetTotals = investments.reduce((acc, inv) => {
      acc[inv.asset_type] = (acc[inv.asset_type] || 0) + inv.current_value
      return acc
    }, {} as Record<string, number>)

    return Object.entries(assetTotals).map(([asset, value]) => ({
      name: asset,
      value: value
    }))
  }

  const getRiskDistributionData = () => {
    return Object.entries(summary?.riskDistribution || {}).map(([risk, value]) => ({
      name: risk.charAt(0).toUpperCase() + risk.slice(1),
      value: value,
      color: RISK_COLORS[risk as keyof typeof RISK_COLORS] || '#6B7280'
    }))
  }

  const getPerformanceData = () => {
    return investments.map(inv => ({
      name: inv.symbol || inv.asset_type,
      returns: inv.current_value - inv.amount_invested,
      value: inv.current_value,
      risk: inv.risk_level
    })).sort((a, b) => b.returns - a.returns)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  const assetTypeData = getAssetTypeData()
  const riskData = getRiskDistributionData()
  const performanceData = getPerformanceData()

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
            <p className="text-gray-600">Track your investments and analyze performance</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddInvestment(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </button>
            <button
              onClick={generateAIInsights}
              disabled={loadingInsights}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center disabled:opacity-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loadingInsights ? 'Analyzing...' : 'AI Analysis'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">${summary?.totalInvested.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">${summary?.totalValue.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className={`text-2xl font-bold ${(summary?.totalReturns || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary?.totalReturns.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">ROI</p>
                <p className={`text-2xl font-bold ${(summary?.roiPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary?.roiPercentage.toFixed(2) || '0.00'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Asset Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Type Distribution</h3>
            {assetTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No investment data available
              </div>
            )}
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No risk data available
              </div>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Performance</h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="returns" fill="#10B981" name="Returns ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No performance data available
            </div>
          )}
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Portfolio Analysis
            </h3>
            <div className="text-gray-700 whitespace-pre-line">{aiInsights}</div>
          </div>
        )}

        {/* Investment List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Investments</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {investment.symbol || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investment.asset_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${investment.amount_invested.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${investment.current_value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${(investment.current_value - investment.amount_invested) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(investment.current_value - investment.amount_invested).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        investment.risk_level === 'low' 
                          ? 'bg-green-100 text-green-800'
                          : investment.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {investment.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Investment Modal */}
        {showAddInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowAddInvestment(false)
              }}
            >
              <h3 id="modal-title" className="text-lg font-semibold text-gray-900 mb-4">
                Add Investment
              </h3>
              <form onSubmit={handleAddInvestment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                    <select
                      value={newInvestment.asset_type}
                      onChange={(e) => setNewInvestment({...newInvestment, asset_type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select asset type</option>
                      {ASSET_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {/* …rest of the form fields unchanged… */}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddInvestment(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Investment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}