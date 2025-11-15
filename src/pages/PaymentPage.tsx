import React from 'react';
import { CreditCard } from 'lucide-react';

const PaymentPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
        <p className="mt-2 text-gray-600">Manage your subscription and payment methods</p>
      </div>

      {/* Content Card */}
      <div className="card p-12 text-center">
        <CreditCard className="h-16 w-16 mx-auto mb-6 text-[#1E90FF]" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Management</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Payment features coming soon. This will allow you to manage your subscription, update payment methods, and view billing history.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
