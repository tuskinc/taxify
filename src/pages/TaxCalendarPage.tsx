import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

// TypeScript interfaces
interface User {
  id: string
  email?: string
  [key: string]: unknown // Allow for additional Supabase user properties
}

interface TaxDeadline {
  id: string
  title: string
  date: string
  type: 'federal' | 'state' | 'quarterly' | 'other'
  priority: 'high' | 'medium' | 'low'
  description: string
  completed: boolean
}

export default function TaxCalendarPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return
        setUser(session?.user as unknown as User ?? null)
        if (!session?.user) {
          void navigate('/login')
          return
        }
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

  useEffect(() => {
    // Load tax deadlines - in a real app, this would come from an API
    const currentYear = new Date().getFullYear()
    const mockDeadlines: TaxDeadline[] = [
      {
        id: '1',
        title: 'Tax Filing Deadline',
        date: `${currentYear.toString()}-04-15`,
        type: 'federal',
        priority: 'high',
        description: 'Last day to file your federal income tax return',
        completed: false
      },
      {
        id: '2',
        title: 'Q1 Estimated Tax Payment',
        date: `${currentYear.toString()}-01-15`,
        type: 'quarterly',
        priority: 'high',
        description: `First quarterly estimated tax payment for ${currentYear.toString()}`,
        completed: true
      },
      {
        id: '3',
        title: 'Q2 Estimated Tax Payment',
        date: `${currentYear.toString()}-04-15`,
        type: 'quarterly',
        priority: 'high',
        description: `Second quarterly estimated tax payment for ${currentYear.toString()}`,
        completed: false
      },
      {
        id: '4',
        title: 'Q3 Estimated Tax Payment',
        date: `${currentYear.toString()}-06-15`,
        type: 'quarterly',
        priority: 'medium',
        description: `Third quarterly estimated tax payment for ${currentYear.toString()}`,
        completed: false
      },
      {
        id: '5',
        title: 'Q4 Estimated Tax Payment',
        date: `${currentYear.toString()}-09-15`,
        type: 'quarterly',
        priority: 'medium',
        description: `Fourth quarterly estimated tax payment for ${currentYear.toString()}`,
        completed: false
      },
      {
        id: '6',
        title: 'State Tax Deadline',
        date: `${currentYear.toString()}-04-15`,
        type: 'state',
        priority: 'high',
        description: 'Most state income tax returns are due',
        completed: false
      },
      {
        id: '7',
        title: 'IRA Contribution Deadline',
        date: `${currentYear.toString()}-04-15`,
        type: 'other',
        priority: 'medium',
        description: `Last day to contribute to traditional IRA for ${(currentYear - 1).toString()} tax year`,
        completed: false
      },
      {
        id: '8',
        title: 'HSA Contribution Deadline',
        date: `${currentYear.toString()}-04-15`,
        type: 'other',
        priority: 'medium',
        description: `Last day to contribute to HSA for ${(currentYear - 1).toString()} tax year`,
        completed: false
      }
    ]
    setDeadlines(mockDeadlines)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'text-blue-600 bg-blue-100'
      case 'state': return 'text-purple-600 bg-purple-100'
      case 'quarterly': return 'text-orange-600 bg-orange-100'
      case 'other': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilDeadline = (dateString: string) => {
    const today = new Date()
    const deadline = new Date(dateString)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const upcomingDeadlines = deadlines
    .filter(d => !d.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const completedDeadlines = deadlines.filter(d => d.completed)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Calendar</h1>
          <p className="text-gray-600">Important tax dates and deadlines for 2024</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Deadlines */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Deadlines
              </h2>
              
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => {
                  const daysUntil = getDaysUntilDeadline(deadline.date)
                  return (
                    <div key={deadline.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-medium text-gray-900 mr-3">{deadline.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)}`}>
                              {deadline.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${getTypeColor(deadline.type)}`}>
                              {deadline.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{deadline.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="font-medium">{formatDate(deadline.date)}</span>
                            {daysUntil >= 0 && (
                              <span className="ml-2 text-orange-600">
                                ({daysUntil === 0 ? 'Today' : `${daysUntil.toString()} days`})
                              </span>
                            )}
                          </div>
                        </div>
                        {daysUntil < 7 && daysUntil >= 0 && (
                          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats & Completed */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming Deadlines</span>
                  <span className="font-medium text-gray-900">{upcomingDeadlines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{completedDeadlines.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-medium text-red-600">
                    {upcomingDeadlines.filter(d => d.priority === 'high').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Completed Deadlines */}
            {completedDeadlines.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed</h3>
                <div className="space-y-3">
                  {completedDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(deadline.date)}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tax Tips</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Set calendar reminders for all deadlines</p>
                <p>• File early to avoid last-minute stress</p>
                <p>• Keep all receipts and documents organized</p>
                <p>• Consider estimated tax payments if you're self-employed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { void navigate('/dashboard') }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
