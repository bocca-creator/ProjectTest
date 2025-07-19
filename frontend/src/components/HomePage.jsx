import React, { useState } from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import MainContent from './MainContent';
import Footer from './Footer';
import { mockData } from '../data/mock';

const HomePage = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    // Mock login - in real app this would call backend
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setUser(null);
    console.log('User logged out');
  };

  return (
    <div className="homepage">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <HeroSection />
      <MainContent 
        announcements={mockData.announcements}
        reviews={mockData.reviews}
        discordData={mockData.discord}
      />
      <Footer />
    </div>
  );
};

export default HomePage;