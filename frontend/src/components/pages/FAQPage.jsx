import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { HelpCircle, Search, ChevronDown, Users, Server, Shield, Gamepad2, MessageSquare, Settings } from 'lucide-react';

const FAQPage = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'general', name: 'General', icon: Users },
    { id: 'servers', name: 'Servers', icon: Server },
    { id: 'account', name: 'Account', icon: Settings },
    { id: 'gameplay', name: 'Gameplay', icon: Gamepad2 },
    { id: 'rules', name: 'Rules', icon: Shield },
    { id: 'community', name: 'Community', icon: MessageSquare }
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What is ProjectTest?',
      answer: 'ProjectTest is a cyberpunk-themed gaming community focused on competitive gameplay, tournaments, and building connections between players. We offer dedicated game servers, community events, and a platform for gamers to connect and compete.',
      popular: true
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Login / Register" button in the top navigation. You can create an account with just a username and password, or use Steam login for instant authentication with your Steam profile information.',
      popular: true
    },
    {
      id: 3,
      category: 'servers',
      question: 'What game servers do you host?',
      answer: 'We currently host servers for various FPS and competitive games. All servers feature anti-cheat protection, 24/7 uptime, and active moderation. Check our server status page for current available games and server information.',
      popular: true
    },
    {
      id: 4,
      category: 'community',
      question: 'How do I join the Discord server?',
      answer: 'Our Discord server is automatically accessible to all registered community members. Look for the "Join Discord Server" button on the main page, or use the Discord widget in the sidebar to connect directly.',
      popular: false
    },
    {
      id: 5,
      category: 'rules',
      question: 'What happens if I break the rules?',
      answer: 'Rule violations are handled with a progressive system: warnings for minor issues, temporary restrictions for moderate violations, and permanent bans for serious offenses like cheating. You can appeal any decision through our contact form.',
      popular: false
    },
    {
      id: 6,
      category: 'gameplay',
      question: 'Is there an anti-cheat system?',
      answer: 'Yes! We use advanced anti-cheat measures across all our servers. We also rely on community reports - if you encounter suspicious behavior, use our reporting system to help maintain fair gameplay for everyone.',
      popular: true
    },
    {
      id: 7,
      category: 'account',
      question: 'Can I link my Steam account?',
      answer: 'Absolutely! Steam integration allows you to login with your Steam credentials, display your Steam avatar, and sync gaming statistics. This feature is completely optional but recommended for the best experience.',
      popular: false
    },
    {
      id: 8,
      category: 'servers',
      question: 'Are servers available 24/7?',
      answer: 'Yes, our servers maintain 24/7 uptime with regular maintenance windows announced in advance. We monitor server performance continuously and have backup systems in place to minimize any downtime.',
      popular: false
    },
    {
      id: 9,
      category: 'community',
      question: 'How do tournaments work?',
      answer: 'We host regular tournaments with prizes for top performers. Tournament announcements are posted on the main page and Discord. Registration is typically open 1-2 weeks before each event. Prizes include gaming gear, game keys, and community recognition.',
      popular: true
    },
    {
      id: 10,
      category: 'general',
      question: 'How do I report bugs or issues?',
      answer: 'Use our contact form to report technical issues, bugs, or suggestions. Include as much detail as possible: what happened, when it occurred, and any error messages. Our team reviews all reports and responds within 24-48 hours.',
      popular: false
    },
    {
      id: 11,
      category: 'account',
      question: 'How do I change my username?',
      answer: 'Username changes are currently handled by admins. Contact us through the support form with your current username, desired new username, and reason for the change. Changes are typically processed within 1-3 business days.',
      popular: false
    },
    {
      id: 12,
      category: 'gameplay',
      question: 'What are the minimum system requirements?',
      answer: 'System requirements vary by game. Generally, you\'ll need a modern graphics card, at least 8GB RAM, and a stable internet connection. Specific requirements for each supported game are listed on our servers page.',
      popular: false
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQs = faqs.filter(faq => faq.popular).slice(0, 4);

  return (
    <div className="faq-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <HelpCircle size={48} className="hero-icon" />
            <h1 className="hero-title">Frequently Asked Questions</h1>
            <p className="hero-description">
              Find quick answers to common questions about ProjectTest community, servers, and gameplay.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div className="faq-search-section">
        <div className="content-container">
          <div className="search-container">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Content - Sequential and Centered */}
      <main className="page-content">
        <div className="content-container">
          
          {/* Categories Section */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>Browse by Category</h2>
            </div>
            <div className="category-list">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const count = category.id === 'all' ? faqs.length : faqs.filter(faq => faq.category === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                  >
                    <IconComponent size={18} />
                    <span>{category.name}</span>
                    <span className="count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Questions */}
          {!searchTerm && activeCategory === 'all' && (
            <div className="sequential-section">
              <div className="section-header">
                <h2>Popular Questions</h2>
              </div>
              <div className="popular-grid">
                {popularFAQs.map((faq) => (
                  <div key={faq.id} className="popular-faq-card" onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                    <h4>{faq.question}</h4>
                    <p>{faq.answer.substring(0, 100)}...</p>
                    <span className="read-more">Click to read full answer</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ List */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>
                {activeCategory === 'all' ? 'All Questions' : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <span className="result-count">{filteredFAQs.length} questions</span>
            </div>

            {filteredFAQs.length === 0 && (
              <div className="no-results">
                <HelpCircle size={48} />
                <h3>No questions found</h3>
                <p>Try adjusting your search terms or select a different category.</p>
              </div>
            )}

            <div className="faq-list">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <div 
                    className="faq-question"
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <h3>{faq.question}</h3>
                    <div className="faq-meta">
                      {faq.popular && <span className="popular-badge">Popular</span>}
                      <ChevronDown 
                        size={20} 
                        className={`expand-icon ${expandedFAQ === faq.id ? 'expanded' : ''}`} 
                      />
                    </div>
                  </div>
                  
                  <div className={`faq-answer ${expandedFAQ === faq.id ? 'expanded' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Still Need Help Section */}
          <div className="sequential-section">
            <div className="help-card">
              <h3>Still Need Help?</h3>
              <p>Can't find what you're looking for? Our support team is ready to assist you.</p>
              <div className="help-actions">
                <button className="btn-primary" onClick={() => window.location.href = '/contact'}>
                  Contact Support
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/rules'}>
                  View Rules
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;