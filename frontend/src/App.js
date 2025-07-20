import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import HomePage from './components/HomePage';
import RulesPage from './components/pages/RulesPage';
import FAQPage from './components/pages/FAQPage';
import ContactPage from './components/pages/ContactPage';
import AboutPage from './components/pages/AboutPage';
import TeamPage from './components/pages/TeamPage';
import LeaderboardPage from './components/pages/LeaderboardPage';
import AccountPage from './components/pages/AccountPage';
import PlayerDashboard from './components/PlayerDashboard';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/dashboard" element={<PlayerDashboard />} />
              </Routes>
            </BrowserRouter>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;