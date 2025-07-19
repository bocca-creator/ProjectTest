import React from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import MainContent from './MainContent';
import Footer from './Footer';
import { mockData } from '../data/mock';

const HomePage = () => {
  return (
    <div className="homepage">
      <Navigation />
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