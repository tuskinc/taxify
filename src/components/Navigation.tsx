import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, LogOut } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavigationProps {
  user: SupabaseUser | null;
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isTabLoading, setIsTabLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Budgeting', href: '/budget' },
    { name: 'Investments', href: '/investments' },
    { name: 'Upload Documents', href: '/upload' },
    { name: 'Tax Scenarios', href: '/tax-scenarios' },
    { name: 'Profile', href: '/profile' },
  ];

  const handleTabClick = (href: string) => {
    if (location.pathname !== href) {
      setIsTabLoading(true);
      navigate(href);
      setTimeout(() => setIsTabLoading(false), 200);
    }
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header with logo */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-[#1E90FF]" fill="#1E90FF" />
            <span className="text-xl font-medium text-gray-900 lowercase">taxfy</span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6">
        <nav className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.href}
              onClick={() => handleTabClick(tab.href)}
              className={`tab-nav-item ${isActive(tab.href) ? 'active' : ''} ${isTabLoading ? 'shimmer' : ''}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
