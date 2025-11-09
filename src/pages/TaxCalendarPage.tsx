import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface TaxDeadline {
  id: string;
  title: string;
  date: string;
  type: 'federal' | 'state' | 'quarterly' | 'other';
  priority: 'high' | 'medium' | 'low';
  description: string;
  completed: boolean;
}

const TaxCalendarPage: React.FC = () => {
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    // Mock data for tax deadlines
    const mockDeadlines: TaxDeadline[] = [
      {
        id: '1',
        title: 'Tax Filing Deadline',
        date: '2024-04-15',
        type: 'federal',
        priority: 'high',
        description: 'Individual income tax returns due',
        completed: false
      },
      {
        id: '2',
        title: 'Quarterly Estimated Tax Payment',
        date: '2024-01-15',
        type: 'quarterly',
        priority: 'medium',
        description: 'Q4 2023 estimated tax payment due',
        completed: true
      },
      {
        id: '3',
        title: 'State Tax Deadline',
        date: '2024-04-15',
        type: 'state',
        priority: 'high',
        description: 'State income tax returns due',
        completed: false
      },
      {
        id: '4',
        title: 'Business Tax Return',
        date: '2024-03-15',
        type: 'federal',
        priority: 'high',
        description: 'Corporate tax returns due',
        completed: false
      },
      {
        id: '5',
        title: 'Quarterly Estimated Tax Payment',
        date: '2024-04-15',
        type: 'quarterly',
        priority: 'medium',
        description: 'Q1 2024 estimated tax payment due',
        completed: false
      }
    ];

    setDeadlines(mockDeadlines);
    setLoading(false);
  };

  const toggleCompleted = (id: string) => {
    setDeadlines(prev => 
      prev.map(deadline => 
        deadline.id === id 
          ? { ...deadline, completed: !deadline.completed }
          : deadline
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'text-blue-600 bg-blue-100';
      case 'state': return 'text-purple-600 bg-purple-100';
      case 'quarterly': return 'text-orange-600 bg-orange-100';
      case 'other': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const upcomingDeadlines = deadlines.filter(d => !d.completed && new Date(d.date) >= new Date());
  const overdueDeadlines = deadlines.filter(d => !d.completed && new Date(d.date) < new Date());
  const completedDeadlines = deadlines.filter(d => d.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tax calendar...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Tax Calendar</h1>
              <p className="mt-2 text-gray-600">Important tax dates and deadlines</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueDeadlines.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-600">{upcomingDeadlines.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedDeadlines.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{deadlines.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overdue Deadlines */}
        {overdueDeadlines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Overdue Deadlines
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              {overdueDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between py-3 border-b border-red-200 last:border-b-0">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deadline.completed}
                      onChange={() => toggleCompleted(deadline.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
                    />
                    <div className="ml-4">
                      <h3 className="font-medium text-red-900">{deadline.title}</h3>
                      <p className="text-sm text-red-700">{deadline.description}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(deadline.type)}`}>
                          {deadline.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)}`}>
                          {deadline.priority}
                        </span>
                        <span className="text-xs text-red-600">
                          Due: {new Date(deadline.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Upcoming Deadlines
          </h2>
          <div className="bg-white rounded-lg shadow">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming deadlines!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => toggleCompleted(deadline.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                          <p className="text-sm text-gray-600">{deadline.description}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(deadline.type)}`}>
                              {deadline.type}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(deadline.priority)}`}>
                              {deadline.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              Due: {new Date(deadline.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completed Deadlines */}
        {completedDeadlines.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Completed Deadlines
            </h2>
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {completedDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={deadline.completed}
                          onChange={() => toggleCompleted(deadline.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900 line-through">{deadline.title}</h3>
                          <p className="text-sm text-gray-600">{deadline.description}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(deadline.type)}`}>
                              {deadline.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              Completed: {new Date(deadline.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCalendarPage;