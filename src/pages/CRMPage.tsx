import React, { useState } from 'react';
import { Building, Link, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react';

interface CRMIntegration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync: string;
  description: string;
  logo: string;
}

const CRMPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<CRMIntegration[]>([
    {
      id: '1',
      name: 'Salesforce',
      status: 'disconnected',
      lastSync: '',
      description: 'Sync customer data and sales information',
      logo: 'SF'
    },
    {
      id: '2',
      name: 'HubSpot',
      status: 'disconnected',
      lastSync: '',
      description: 'Import contacts and deal information',
      logo: 'HS'
    },
    {
      id: '3',
      name: 'Pipedrive',
      status: 'disconnected',
      lastSync: '',
      description: 'Connect sales pipeline data',
      logo: 'PD'
    },
    {
      id: '4',
      name: 'Zoho CRM',
      status: 'disconnected',
      lastSync: '',
      description: 'Sync customer and lead data',
      logo: 'ZC'
    }
  ]);
  

  const handleConnect = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: 'pending',
              lastSync: new Date().toISOString()
            }
          : integration
      )
    );

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === id 
            ? { 
                ...integration, 
                status: 'connected',
                lastSync: new Date().toISOString()
              }
            : integration
        )
      );
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: 'disconnected',
              lastSync: ''
            }
          : integration
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const pendingCount = integrations.filter(i => i.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CRM Integration</h1>
              <p className="mt-2 text-gray-600">Connect your CRM system for automatic data sync</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Connected Systems</p>
                <p className="text-lg font-semibold">{connectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-blue-600">{integrations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="card bg-blue-50 border border-blue-200 p-6 mb-8">
          <div className="flex items-start">
            <Link className="h-6 w-6 text-blue-600 mt-1 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How CRM Integration Works</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Connect your CRM system to automatically sync customer data</li>
                <li>• Import sales information for better tax planning</li>
                <li>• Track business expenses and revenue from your CRM</li>
                <li>• Generate tax reports with integrated financial data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CRM Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">{integration.logo}</span>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span className="ml-1 capitalize">{integration.status}</span>
                  </span>
                </div>
              </div>
              
              {integration.lastSync && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                {integration.status === 'connected' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => { handleDisconnect(integration.id); }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                    <button
                      type="button"
                      aria-disabled="true"
                      disabled
                      title="Settings not available yet"
                      className="text-blue-600 text-sm font-medium flex items-center opacity-50 cursor-not-allowed pointer-events-none"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </button>
                  </div>
                ) : integration.status === 'pending' ? (
                  <div className="flex items-center text-yellow-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Connecting...</span>
                    </div>
                  ) : (
                  <button
                    onClick={() => { handleConnect(integration.id); }}
                    className="btn btn-primary text-sm flex items-center"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Connect
                  </button>
                )}
                
                <button
                  type="button"
                  aria-disabled="true"
                  disabled
                  title="Learn More coming soon"
                  className="text-gray-600 text-sm font-medium flex items-center opacity-50 cursor-not-allowed pointer-events-none"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Data Sync Information */}
        <div className="mt-8 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sync Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
              <h4 className="font-medium text-gray-900 mb-2">What gets synced:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customer contact information</li>
                <li>• Sales transactions and revenue</li>
                <li>• Business expenses</li>
                <li>• Deal and opportunity data</li>
              </ul>
            </div>
              <div>
              <h4 className="font-medium text-gray-900 mb-2">Sync frequency:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time for new transactions</li>
                <li>• Daily batch sync for historical data</li>
                <li>• Manual sync available anytime</li>
                <li>• Automatic error handling and retry</li>
              </ul>
              </div>
            </div>
          </div>
    </div>
  );
};

export default CRMPage;