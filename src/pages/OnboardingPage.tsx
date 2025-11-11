import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfileSetup from '../components/UserProfileSetup';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          navigate('/login');
          return;
        }
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleProfileComplete = async (profile: any) => {
    // Check if user has completed onboarding
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (userProfile?.tax_scenarios && userProfile.tax_scenarios.length > 0) {
      navigate('/dashboard');
    } else {
      // Navigate to scenario selection or dashboard
    navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-taxify flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-taxify">
      <UserProfileSetup 
        user={user} 
        onComplete={handleProfileComplete}
      />
    </div>
  );
};

export default OnboardingPage;
