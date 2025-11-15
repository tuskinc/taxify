import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import { supabase } from './lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Import all page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import BudgetingPage from './pages/BudgetingPage';
import InvestmentsPage from './pages/InvestmentsPage';
import TaxCalendarPage from './pages/TaxCalendarPage';
import CRMPage from './pages/CRMPage';
import TaxScenariosPage from './pages/TaxScenariosPage';
import TaxSummaryPage from './pages/TaxSummaryPage';
import TaxOptimizationPage from './pages/TaxOptimizationPage';
import ProfilePage from './pages/ProfilePage';
import UploadPage from './pages/UploadPage';
import SupportPage from './pages/SupportPage';
import PaymentPage from './pages/PaymentPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout component for protected routes
interface ProtectedLayoutProps {
  children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(user);
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-taxify">
      <Navigation user={user} />
      <div className="page-wrapper">
        {children}
      </div>
    </div>
  );
};

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      {/* Protected Routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ReportsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/budget" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <BudgetingPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/investments" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <InvestmentsPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tax-calendar" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <TaxCalendarPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/crm" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <CRMPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tax-scenarios" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <TaxScenariosPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/tax-summary" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <TaxSummaryPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/optimize-tax" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <TaxOptimizationPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/upload" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <UploadPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/support" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <SupportPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/payment" element={
        <ProtectedRoute>
          <ProtectedLayout>
            <PaymentPage />
          </ProtectedLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
