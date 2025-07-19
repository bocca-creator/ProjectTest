import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Users, Target, Award, Calendar, Gamepad2, Shield, Zap, TrendingUp } from 'lucide-react';

const AboutPage = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const milestones = [
    {
      year: '2023',
      title: 'ProjectTest Founded',
      description: 'Started as a small gaming community with a vision to create the ultimate cyberpunk gaming experience.',
      icon: Gamepad2
    },
    {
      year: '2024',
      title: 'First Tournament Series',
      description: 'Launched our competitive tournament series with over 500 participants and $10,000 in prizes.',
      icon: Award
    },
    {
      year: '2024',
      title: 'Community Growth',
      description: 'Reached 1,000+ active members and expanded to multiple game servers.',
      icon: TrendingUp
    },
    {
      year: '2025',
      title: 'Platform Expansion',
      description: 'Launched new website, enhanced Discord integration, and added advanced anti-cheat systems.',
      icon: Zap
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'State-of-the-art anti-cheat systems and active moderation ensure fair gameplay for everyone.',
      stats: '99.9% cheat detection rate'
    },
    {
      icon: Users,
      title: 'Thriving Community',
      description: 'Join thousands of passionate gamers in our welcoming and competitive environment.',
      stats: '2,847+ active members'
    },
    {
      icon: Award,
      title: 'Regular Tournaments',
      description: 'Monthly tournaments with real prizes and recognition for top performers.',
      stats: '$50K+ total prizes awarded'
    },
    {
      icon: Zap,
      title: '24/7 Servers',
      description: 'High-performance dedicated servers with 99.9% uptime and low latency.',
      stats: '< 20ms average latency'
    }
  ];

  const stats = [
    { number: '2,847', label: 'Active Members', subtext: 'Growing daily' },
    { number: '156', label: 'Online Now', subtext: 'Peak: 342 players' },
    { number: '24/7', label: 'Server Uptime', subtext: '99.9% reliability' },
    { number: '48', label: 'Tournaments Hosted', subtext: 'Since launch' },
    { number: '12', label: 'Game Servers', subtext: 'Multiple regions' },
    { number: '4.8/5', label: 'User Rating', subtext: 'Based on 420+ reviews' }
  ];

  const values = [
    {
      title: 'Fair Play',
      description: 'We believe in equal opportunities for all players. Our advanced anti-cheat systems and transparent moderation ensure everyone has a fair shot at victory.',
      icon: Shield
    },
    {
      title: 'Community First',
      description: 'Our community drives everything we do. Member feedback shapes our decisions, and we prioritize creating spaces where friendships and rivalries can flourish.',
      icon: Users
    },
    {
      title: 'Continuous Innovation',
      description: 'We constantly evolve and improve our platform, adding new features, games, and experiences to keep our community engaged and excited.',
      icon: Zap
    },
    {
      title: 'Competitive Excellence',
      description: 'We support players at all skill levels while fostering an environment where competitive gamers can push their limits and achieve greatness.',
      icon: Target
    }
  ];

  return (
    <div className="about-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
          <div className="neon-particles"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">About ProjectTest</h1>
              <p className="hero-description">
                We're building the future of competitive gaming communities. Born from a passion for cyberpunk aesthetics 
                and fair competition, ProjectTest brings together players who demand excellence, integrity, and innovation.
              </p>
              <div className="hero-cta">
                <button className="btn-primary" onClick={() => window.location.href = '/'}>
                  Join Community
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/contact'}>
                  Get in Touch
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="content-container">
          <h2>Community by the Numbers</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-subtext">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="content-container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p className="mission-statement">
                To create the ultimate cyberpunk gaming community where players can compete at the highest level, 
                forge lasting friendships, and push the boundaries of what's possible in competitive gaming.
              </p>
              <p className="mission-description">
                We believe gaming is more than entertainment—it's a platform for connection, growth, and achievement. 
                ProjectTest provides the infrastructure, community, and opportunities for gamers to reach their full potential 
                while maintaining the integrity and spirit of fair competition.
              </p>
            </div>
            <div className="mission-visual">
              <div className="cyber-emblem">
                <Gamepad2 size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="content-container">
          <h2>What Sets Us Apart</h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-stat">{feature.stats}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="content-container">
          <h2>Our Journey</h2>
          <div className="timeline">
            {milestones.map((milestone, index) => {
              const IconComponent = milestone.icon;
              return (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker">
                    <IconComponent size={24} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-year">{milestone.year}</div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="content-container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="value-card">
                  <div className="value-header">
                    <IconComponent size={28} />
                    <h3>{value.title}</h3>
                  </div>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="cta-section">
        <div className="content-container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Join ProjectTest?</h2>
              <p>
                Become part of our growing community and experience competitive gaming like never before. 
                Connect with players, join tournaments, and make your mark in the cyberpunk gaming world.
              </p>
              <div className="cta-actions">
                <button className="btn-primary" onClick={() => window.location.href = '/'}>
                  <Users size={18} />
                  Join Now
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/rules'}>
                  <Shield size={18} />
                  Read Rules
                </button>
              </div>
            </div>
            <div className="cta-stats">
              <div className="mini-stat">
                <span className="mini-stat-number">2,847</span>
                <span className="mini-stat-label">Members</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-number">156</span>
                <span className="mini-stat-label">Online</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-number">4.8★</span>
                <span className="mini-stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;