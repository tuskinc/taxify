import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    void navigate('/login');
  };

  return (
    <LandingPage onGetStarted={handleGetStarted} />
  );
};

export default HomePage;
