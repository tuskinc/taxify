import React from 'react';
import { FileText } from 'lucide-react';

const TaxSummaryPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tax Summary</h1>
        <p className="mt-2 text-gray-600">View your comprehensive tax summary</p>
      </div>

      {/* Content Card */}
      <div className="card p-12 text-center">
        <FileText className="h-16 w-16 mx-auto mb-6 text-[#1E90FF]" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tax Summary</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Tax summary features coming soon. This will provide a comprehensive overview of your tax situation and calculations.
        </p>
      </div>
    </div>
  );
};

export default TaxSummaryPage;
