import React from 'react';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Tax Analysis Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Recent Analyses
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600">No analyses yet. Complete your profile to get started.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Tax Calendar
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600">Important tax dates will appear here.</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Quick Actions
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-600">Quick access to common tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
