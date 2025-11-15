import React from 'react';
import { Calculator } from 'lucide-react';

const TaxScenariosPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tax Scenarios</h1>
        <p className="mt-2 text-gray-600">Plan and compare different tax scenarios</p>
      </div>

      {/* Content Card */}
      <div className="card p-12 text-center">
        <Calculator className="h-16 w-16 mx-auto mb-6 text-[#1E90FF]" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tax Scenario Planning</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Tax scenario planning features coming soon. This will allow you to compare different tax strategies and see their impact on your financial situation.
        </p>
      </div>
    </div>
  );
};

export default TaxScenariosPage;
