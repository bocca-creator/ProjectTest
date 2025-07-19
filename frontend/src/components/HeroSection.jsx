import React from 'react';
import { Shield, Users, Gamepad2, Zap } from 'lucide-react';

const HeroSection = () => {
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
              <span className="title-main">Welcome to</span>
              <span className="title-highlight">ProjectTest</span>
              <span className="title-subtitle">Gaming Community</span>
            </h1>
            
            <p className="hero-description">
              Join the ultimate cyberpunk gaming experience. Connect with players, 
              compete in tournaments, and dominate the digital battlefield.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <Users size={20} />
                <span className="stat-number">2,847</span>
                <span className="stat-label">Active Players</span>
              </div>
              <div className="stat-item">
                <Gamepad2 size={20} />
                <span className="stat-number">156</span>
                <span className="stat-label">Online Now</span>
              </div>
              <div className="stat-item">
                <Zap size={20} />
                <span className="stat-number">24/7</span>
                <span className="stat-label">Server Uptime</span>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-primary hero-btn">
                Join Community
                <Zap size={18} />
              </button>
              <button className="btn-secondary hero-btn">
                View Servers
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="project-rules-card">
              <div className="card-header">
                <Shield size={24} />
                <h3>Project Rules</h3>
              </div>
              <div className="card-content">
                <ul className="rules-list">
                  <li>✓ Respect all community members</li>
                  <li>✓ No cheating or exploiting</li>
                  <li>✓ Follow fair play guidelines</li>
                  <li>✓ Keep communications civil</li>
                  <li>✓ Report suspicious activities</li>
                </ul>
                <button className="btn-ghost">Read Full Rules</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;