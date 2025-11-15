import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { supabase } from '../lib/supabase';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [personalFinances, setPersonalFinances] = useState<any>(null);
  const [businessFinances, setBusinessFinances] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Load user profile and finances
        loadUserData(user.id);
      }
    };
    getUser();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        setUserProfile(profile);
      }

      // Load personal finances
      const { data: personal } = await supabase
        .from('personal_finances')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (personal) {
        setPersonalFinances(personal);
      }

      // Load business finances
      const { data: business } = await supabase
        .from('business_finances')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (business) {
        setBusinessFinances(business);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <Dashboard
        user={user}
        userProfile={userProfile}
        personalFinances={personalFinances}
        businessFinances={businessFinances}
        onStartNewAnalysis={() => navigate('/reports')}
        onUploadDocuments={() => navigate('/upload')}
        onGenerateReport={() => navigate('/reports')}
        onConnectCRM={() => navigate('/crm')}
        onTaxCalendar={() => navigate('/tax-calendar')}
        onTaxOptimization={() => navigate('/optimize-tax')}
      />
    </div>
  );
};

export default DashboardPage;
