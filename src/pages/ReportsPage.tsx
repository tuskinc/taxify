import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComprehensiveAnalysisReport from '../components/ComprehensiveAnalysisReport';
import { supabase } from '../lib/supabase';

const ReportsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [personalFinances, setPersonalFinances] = useState<any>(null);
  const [businessFinances, setBusinessFinances] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setUser(user);

        // Load user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }

        // Load personal finances
        const { data: personal } = await supabase
          .from('personal_finances')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (personal) {
          setPersonalFinances(personal);
        }

        // Load business finances
        const { data: business } = await supabase
          .from('business_finances')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (business) {
          setBusinessFinances(business);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || !personalFinances) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h1>
          <p className="text-gray-600 mb-4">Please complete your profile and financial information first.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-taxify">
      <ComprehensiveAnalysisReport
        user={user}
        userProfile={userProfile}
        personalFinances={personalFinances}
        businessFinances={businessFinances}
        onComplete={() => navigate('/dashboard')}
        onBackToDashboard={handleBackToDashboard}
      />
    </div>
  );
};

export default ReportsPage;
