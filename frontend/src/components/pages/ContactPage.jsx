import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle, Clock, User, FileText } from 'lucide-react';

const ContactPage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'normal'
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'technical', label: 'Technical Support', icon: AlertCircle },
    { value: 'account', label: 'Account Issues', icon: User },
    { value: 'report', label: 'Report Player/Bug', icon: FileText },
    { value: 'appeal', label: 'Ban Appeal', icon: CheckCircle },
    { value: 'suggestion', label: 'Feedback/Suggestion', icon: MessageSquare }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'var(--accent-blue)', time: '3-5 days' },
    { value: 'normal', label: 'Normal Priority', color: 'var(--accent-primary)', time: '1-2 days' },
    { value: 'high', label: 'High Priority', color: 'var(--warning)', time: '12-24 hours' },
    { value: 'urgent', label: 'Urgent', color: 'var(--error)', time: '2-6 hours' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        priority: 'normal'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get detailed help via email',
      detail: 'support@projecttest.com',
      responseTime: 'Within 24 hours'
    },
    {
      icon: MessageSquare,
      title: 'Discord Support',
      description: 'Quick help from community',
      detail: 'ProjectTest Discord Server',
      responseTime: 'Usually within 1 hour'
    },
    {
      icon: FileText,
      title: 'Submit Ticket',
      description: 'Formal support request',
      detail: 'Use the form below',
      responseTime: 'Based on priority level'
    }
  ];

  return (
    <div className="contact-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <Mail size={48} className="hero-icon" />
            <h1 className="hero-title">Contact & Support</h1>
            <p className="hero-description">
              Need help or have feedback? Our support team is here to assist you with any questions or issues.
            </p>
          </div>
        </div>
      </section>

      {/* Page Content - Sequential and Centered */}
      <main className="page-content">
        <div className="content-container">
          
          {/* Contact Methods Section */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>How Can We Help You?</h2>
            </div>
            <div className="methods-grid">
              {contactMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <div key={index} className="method-card">
                    <IconComponent size={32} />
                    <h3>{method.title}</h3>
                    <p>{method.description}</p>
                    <div className="method-detail">{method.detail}</div>
                    <div className="response-time">
                      <Clock size={14} />
                      {method.responseTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="sequential-section">
            <div className="form-container">
              <div className="section-header">
                <h2>Submit a Support Ticket</h2>
                <p className="section-subtitle">Provide detailed information to help us assist you better</p>
              </div>

              {submitStatus === 'success' && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  <div>
                    <h4>Ticket Submitted Successfully!</h4>
                    <p>We've received your message and will respond within the expected timeframe based on priority level.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of your issue"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority Level</label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label} ({priority.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Detailed Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Please provide as much detail as possible about your issue, including steps to reproduce, error messages, or specific questions..."
                    className="form-textarea"
                  />
                  <div className="character-count">
                    {formData.message.length}/2000 characters
                  </div>
                </div>

                <div className="priority-info">
                  <div className="priority-display">
                    <span>Selected Priority: </span>
                    <span 
                      className="priority-badge"
                      style={{ 
                        color: priorities.find(p => p.value === formData.priority)?.color,
                        borderColor: priorities.find(p => p.value === formData.priority)?.color
                      }}
                    >
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </span>
                    <span className="expected-response">
                      Expected response: {priorities.find(p => p.value === formData.priority)?.time}
                    </span>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Support Info Section */}
          <div className="sequential-section">
            <div className="support-info">
              <div className="info-card">
                <h3>Before You Submit</h3>
                <ul>
                  <li>Check our <a href="/faq">FAQ page</a> for quick answers</li>
                  <li>Review <a href="/rules">community rules</a> for policy questions</li>
                  <li>Include screenshots or error messages when reporting bugs</li>
                  <li>Be specific about when the issue occurred</li>
                  <li>Mention your username and affected servers if relevant</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>Emergency Contact</h3>
                <p>For urgent security issues or serious rule violations:</p>
                <div className="emergency-contact">
                  <strong>Discord: </strong>
                  <span>@Admin (mention in #emergency channel)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;