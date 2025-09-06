import { useState } from 'react';
import { BusinessFinances } from '../App';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BusinessFinanceFormProps {
  onComplete: (data: Partial<BusinessFinances>) => void;
  onBack: () => void;
}

export default function BusinessFinanceForm({ onComplete, onBack }: BusinessFinanceFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Placeholder business data
    const businessData = {
      revenue: 0,
      employee_costs: 0,
      equipment: 0,
      rent: 0,
      utilities: 0,
      marketing: 0,
      travel_expenses: 0,
      office_supplies: 0,
      professional_services: 0,
      insurance: 0,
      other_expenses: 0,
    };
    
    // Simulate API call
    setTimeout(() => {
      onComplete(businessData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Business Financial Information</h2>
          <p className="text-gray-600">
            Business finance form will be implemented here.
          </p>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">
            This component will collect business revenue, expenses, and other financial data.
          </p>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  Continue to Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
