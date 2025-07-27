import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Shield, AlertTriangle, CheckCircle, Users, Gamepad2, MessageSquare, Ban, Eye } from 'lucide-react';

const RulesPage = () => {
  const [user, setUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const rulesSections = [
    {
      id: 'general',
      title: 'General Community Rules',
      icon: Users,
      color: 'var(--accent-primary)',
      rules: [
        {
          number: '1.1',
          title: 'Respect All Members',
          description: 'Treat all community members with respect and courtesy. Harassment, discrimination, or toxic behavior will not be tolerated.',
          severity: 'high'
        },
        {
          number: '1.2', 
          title: 'English Communication',
          description: 'Primary language for all public channels is English. Other languages are allowed in designated channels.',
          severity: 'medium'
        },
        {
          number: '1.3',
          title: 'No Spam or Flooding',
          description: 'Avoid repetitive messages, excessive caps lock, or flooding chat channels.',
          severity: 'medium'
        },
        {
          number: '1.4',
          title: 'Appropriate Content Only',
          description: 'No NSFW, illegal, or offensive content. Keep all discussions appropriate for gaming community.',
          severity: 'high'
        }
      ]
    },
    {
      id: 'gameplay',
      title: 'Gameplay & Fair Play',
      icon: Gamepad2,
      color: 'var(--accent-blue)',
      rules: [
        {
          number: '2.1',
          title: 'No Cheating or Exploiting',
          description: 'Any form of cheating, hacking, or exploiting game mechanics is strictly prohibited.',
          severity: 'critical'
        },
        {
          number: '2.2',
          title: 'Fair Team Play',
          description: 'Work with your team, no intentional team killing or griefing teammates.',
          severity: 'high'
        },
        {
          number: '2.3',
          title: 'No Stream Sniping',
          description: 'Using someone\'s live stream to gain unfair advantages is prohibited.',
          severity: 'medium'
        },
        {
          number: '2.4',
          title: 'Report Suspicious Activity',
          description: 'If you encounter cheaters or rule breakers, report them through proper channels.',
          severity: 'low'
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Guidelines',
      icon: MessageSquare,
      color: 'var(--accent-purple)',
      rules: [
        {
          number: '3.1',
          title: 'Use Voice Chat Responsibly',
          description: 'Keep voice communications clear, relevant, and respectful. No excessive background noise.',
          severity: 'medium'
        },
        {
          number: '3.2',
          title: 'No Advertisement or Self-Promotion',
          description: 'Advertising other servers, personal channels, or commercial content requires admin approval.',
          severity: 'medium'
        },
        {
          number: '3.3',
          title: 'Constructive Criticism Only',
          description: 'Provide helpful feedback. Personal attacks or unconstructive criticism are not allowed.',
          severity: 'medium'
        }
      ]
    },
    {
      id: 'consequences',
      title: 'Rule Violations & Consequences',
      icon: Ban,
      color: 'var(--error)',
      rules: [
        {
          number: '4.1',
          title: 'Warning System',
          description: 'First-time minor violations typically result in warnings. Repeated violations escalate penalties.',
          severity: 'info'
        },
        {
          number: '4.2',
          title: 'Temporary Restrictions',
          description: 'Temporary mutes, kicks, or short-term bans may be applied for moderate violations.',
          severity: 'medium'
        },
        {
          number: '4.3',
          title: 'Permanent Bans',
          description: 'Serious violations like cheating, doxxing, or severe harassment result in permanent bans.',
          severity: 'critical'
        },
        {
          number: '4.4',
          title: 'Appeal Process',
          description: 'Banned members can appeal through our contact form. All appeals are reviewed by admin team.',
          severity: 'info'
        }
      ]
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'var(--error)';
      case 'high': return 'var(--warning)';
      case 'medium': return 'var(--accent-primary)';
      case 'low': return 'var(--accent-blue)';
      case 'info': return 'var(--text-muted)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={16} />;
      case 'high': return <Shield size={16} />;
      case 'medium': return <Eye size={16} />;
      case 'low': return <CheckCircle size={16} />;
      case 'info': return <MessageSquare size={16} />;
      default: return <Shield size={16} />;
    }
  };

  return (
    <div className="rules-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <Shield size={48} className="hero-icon" />
            <h1 className="hero-title">Community Rules</h1>
            <p className="hero-description">
              Our guidelines ensure a fair, respectful, and enjoyable gaming experience for all ProjectTest community members.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{rulesSections.length}</span>
                <span className="stat-label">Rule Categories</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {rulesSections.reduce((total, section) => total + section.rules.length, 0)}
                </span>
                <span className="stat-label">Total Rules</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Moderation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Content - Sequential and Centered */}
      <main className="page-content">
        <div className="content-container">
          
          {/* Introduction Section */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>Before You Begin</h2>
              <p className="section-subtitle">
                Welcome to ProjectTest! These rules are designed to maintain a positive gaming environment. 
                By participating in our community, you agree to follow these guidelines. Ignorance of rules is not an excuse for violations.
              </p>
            </div>
            <div className="intro-highlights">
              <div className="highlight-item">
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <span>Rules apply to all community platforms</span>
              </div>
              <div className="highlight-item">
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <span>Admins have final discretion on rule interpretation</span>
              </div>
              <div className="highlight-item">
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <span>Rules may be updated - check regularly</span>
              </div>
            </div>
          </div>

          {/* Rules Sections */}
          <div className="sequential-section">
            <div className="rules-sections">
              {rulesSections.map((section) => {
                const IconComponent = section.icon;
                const isExpanded = expandedSection === section.id;

                return (
                  <div key={section.id} className="rules-section">
                    <div 
                      className="section-header" 
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    >
                      <div className="section-title">
                        <IconComponent size={24} style={{ color: section.color }} />
                        <h3>{section.title}</h3>
                        <span className="rule-count">{section.rules.length} rules</span>
                      </div>
                      <div className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                        ▼
                      </div>
                    </div>

                    <div className={`section-content ${isExpanded ? 'expanded' : ''}`}>
                      {section.rules.map((rule) => (
                        <div key={rule.number} className="rule-item">
                          <div className="rule-header">
                            <div className="rule-number">{rule.number}</div>
                            <div className="rule-title-section">
                              <h4 className="rule-title">{rule.title}</h4>
                              <div 
                                className="rule-severity"
                                style={{ color: getSeverityColor(rule.severity) }}
                              >
                                {getSeverityIcon(rule.severity)}
                                <span>{rule.severity}</span>
                              </div>
                            </div>
                          </div>
                          <p className="rule-description">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Info Section */}
          <div className="sequential-section">
            <div className="section-header">
              <h3>Need Help or Have Questions?</h3>
              <p className="section-subtitle">If you're unsure about any rule or need clarification, don't hesitate to contact our admin team.</p>
            </div>
            <div className="info-actions">
              <button className="btn-primary" onClick={() => window.location.href = '/contact'}>
                Contact Admins
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = '/faq'}>
                View FAQ
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RulesPage;