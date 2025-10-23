import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface CRMProvider {
  id: string
  name: string
  description: string
  connected: boolean
  logo: string
}

export default function CRMPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const navigate = useNavigate()

  const crmProviders: CRMProvider[] = [
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Connect your QuickBooks account to automatically sync financial data',
      connected: false,
      logo: 'QB'
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Import your Xero accounting data for seamless tax analysis',
      connected: false,
      logo: 'X'
    },
    {
      id: 'freshbooks',
      name: 'FreshBooks',
      description: 'Sync invoices and expenses from FreshBooks',
      connected: false,
      logo: 'FB'
    }
  ]

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

  const handleConnect = async (providerId: string) => {
    setConnecting(providerId)
    try {
      // Call CRM API to initiate OAuth flow
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          action: 'connect'
        })
      })

      const result = await response.json()
      
      if (result.success && result.authUrl) {
        // In a real implementation, redirect to OAuth URL
        window.open(result.authUrl, '_blank')
      } else {
        console.error('Failed to initiate connection:', result.error)
      }
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    try {
      // Call API to disconnect
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          action: 'disconnect'
        })
      })

      const result = await response.json()
      if (result.success) {
        // Update UI to show disconnected
        console.log('Disconnected from', providerId)
      }
    } catch (error) {
      console.error('Disconnect failed:', error)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#fdf9f6]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect CRM</h1>
          <p className="text-gray-600">Connect your accounting software to automatically sync financial data</p>
        </div>

        {/* CRM Providers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {crmProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-lg">{provider.logo}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-500">Accounting Software</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{provider.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {provider.connected ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Not Connected</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => provider.connected ? handleDisconnect(provider.id) : handleConnect(provider.id)}
                  disabled={connecting === provider.id}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    provider.connected
                      ? 'text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400'
                      : 'text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400'
                  } ${connecting === provider.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {connecting === provider.id ? 'Connecting...' : provider.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits of CRM Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Automatic Data Sync</h4>
                <p className="text-sm text-gray-600">No more manual data entry - your financial data syncs automatically</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Real-time Updates</h4>
                <p className="text-sm text-gray-600">Get the latest financial data for accurate tax analysis</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Error Reduction</h4>
                <p className="text-sm text-gray-600">Eliminate manual entry errors and ensure data accuracy</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Time Savings</h4>
                <p className="text-sm text-gray-600">Focus on tax strategy instead of data entry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
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
