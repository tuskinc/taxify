import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LandingPage onGetStarted={() => navigate('/login')} />
  );
};

export default HomePage;
