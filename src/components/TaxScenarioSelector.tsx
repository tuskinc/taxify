import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TaxScenario } from '../App';
import { User, Building2, Calculator, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

interface TaxScenarioSelectorProps {
  onSelect: (scenario: TaxScenario) => void;
}

const scenarios = [
  {
    id: 'personal' as TaxScenario,
    title: 'Personal & Family Taxes',
    description: 'Optimize your personal income taxes, deductions, and family tax credits',
    icon: User,
    features: [
      'Personal income tax optimization',
      'Family tax credit maximization',
      'Retirement contribution planning',
      'Deduction optimization strategies',
      'Tax bracket analysis',
      'Quarterly estimated tax planning'
    ],
    estimatedTime: '5-7 minutes',
    bestFor: 'Individuals, families, employees, retirees'
  },
  {
    id: 'business' as TaxScenario,
    title: 'Business Tax Planning',
    description: 'Strategic business tax planning for entrepreneurs and business owners',
    icon: Building2,
    features: [
      'Business expense optimization',
      'Corporate tax rate analysis',
      'Business structure optimization',
      'Depreciation and amortization',
      'Employee benefit planning',
      'Quarterly business tax planning'
    ],
    estimatedTime: '7-10 minutes',
    bestFor: 'Business owners, entrepreneurs, freelancers'
  },
  {
    id: 'combined' as TaxScenario,
    title: 'Combined Personal + Business',
    description: 'Comprehensive tax strategy combining personal and business optimization',
    icon: TrendingUp,
    features: [
      'Personal and business tax integration',
      'Salary vs dividend optimization',
      'Business expense personal benefit analysis',
      'Family business tax planning',
      'Retirement planning through business',
      'Comprehensive tax calendar planning'
    ],
    estimatedTime: '10-12 minutes',
    bestFor: 'Business owners with families, entrepreneurs with personal investments'
  }
];

export default function TaxScenarioSelector({ onSelect }: TaxScenarioSelectorProps) {
  const [selectedScenario, setSelectedScenario] = useState<TaxScenario | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScenarioSelect = async (scenario: TaxScenario) => {
    setSelectedScenario(scenario);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update user's tax scenarios
        const { error } = await supabase
          .from('users')
          .update({ 
            tax_scenarios: scenario === 'combined' ? ['personal', 'business'] : [scenario]
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating tax scenarios:', error);
        }
      }
    } catch (error) {
      console.error('Error updating tax scenarios:', error);
    } finally {
      setLoading(false);
      onSelect(scenario);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Tax Analysis Type
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the type of tax analysis that best fits your needs. 
          You can always change this later or run multiple analyses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          const isSelected = selectedScenario === scenario.id;
          
          return (
            <div
              key={scenario.id}
              className={`card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200' 
                  : 'hover:border-primary-300'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <div className="text-center mb-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-primary-600' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-8 h-8 ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className={`text-xl font-semibold ${
                  isSelected ? 'text-primary-700' : 'text-gray-900'
                }`}>
                  {scenario.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  isSelected ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {scenario.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {scenario.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                    <span className={isSelected ? 'text-primary-700' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Meta Information */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimated time:</span>
                  <span className="font-medium text-gray-700">{scenario.estimatedTime}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Best for: {scenario.bestFor}
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="text-center">
        <button
          onClick={() => selectedScenario && handleScenarioSelect(selectedScenario)}
          disabled={!selectedScenario || loading}
          className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Setting up analysis...
            </div>
          ) : (
            <div className="flex items-center">
              Continue with {selectedScenario ? scenarios.find(s => s.id === selectedScenario)?.title : 'Analysis'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">💡 Need Help Choosing?</h4>
          <p className="text-sm text-blue-700">
            <strong>Personal:</strong> If you're an employee or individual with personal finances<br/>
            <strong>Business:</strong> If you own a business or are self-employed<br/>
            <strong>Combined:</strong> If you want to optimize both personal and business taxes together
          </p>
        </div>
      </div>
    </div>
  );
}
