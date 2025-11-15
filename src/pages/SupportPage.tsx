import React from 'react';
import { HelpCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="mt-2 text-gray-600">Get help and support for your tax questions</p>
      </div>

      {/* Content Card */}
      <div className="card p-12 text-center">
        <HelpCircle className="h-16 w-16 mx-auto mb-6 text-[#1E90FF]" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Support Center</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Support features coming soon. This will include help documentation, FAQs, and contact options.
        </p>
      </div>
    </div>
  );
};

export default SupportPage;
