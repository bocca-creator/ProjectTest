import React from 'react';
import { Shield, Users, Target, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HeroSection = () => {
  const { t, formatNumber } = useLanguage();
  
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="cyber-grid"></div>
        <div className="neon-particles"></div>
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-main">{t('hero.welcome')}</span>
              <span className="title-highlight">ProjectTest</span>
              <span className="title-subtitle">{t('hero.subtitle')}</span>
            </h1>
            
            <p className="hero-description">
              {t('hero.description')}
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <Users size={20} />
                <span className="stat-number">{formatNumber(2847)}</span>
                <span className="stat-label">{t('hero.activePlayersLabel')}</span>
              </div>
              <div className="stat-item">
                <Gamepad2 size={20} />
                <span className="stat-number">{formatNumber(156)}</span>
                <span className="stat-label">{t('hero.onlineNowLabel')}</span>
              </div>
              <div className="stat-item">
                <Zap size={20} />
                <span className="stat-number">24/7</span>
                <span className="stat-label">{t('hero.serverUptimeLabel')}</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-primary hero-btn">
                {t('hero.joinCommunity')}
                <Zap size={18} />
              </button>
              <button className="btn-secondary hero-btn">
                {t('hero.viewServers')}
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="project-rules-card">
              <div className="card-header">
                <Shield size={24} />
                <h3>{t('rules.title')}</h3>
              </div>
              <div className="card-content">
                <ul className="rules-list">
                  <li>✓ {t('rules.respectMembers')}</li>
                  <li>✓ {t('rules.noCheating')}</li>
                  <li>✓ {t('rules.fairPlay')}</li>
                  <li>✓ {t('rules.civilCommunication')}</li>
                  <li>✓ {t('rules.reportSuspicious')}</li>
                </ul>
                <button className="btn-ghost">{t('rules.readFullRules')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;