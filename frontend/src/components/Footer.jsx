import React from 'react';
import { ExternalLink, Heart, Shield, DollarSign, FileText, Phone, HelpCircle, Users, Mail } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'Rules', href: '/rules', icon: Shield },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Team', href: '/team', icon: Users }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Community Guidelines', href: '/rules' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">ProjectTest</h3>
            <p className="footer-description">
              The ultimate cyberpunk gaming community where players unite, 
              compete, and dominate the digital realm together.
            </p>
            <div className="footer-social">
              <h4>Join Our Community</h4>
              <div className="social-links">
                <a href="https://discord.gg/projecttest" className="social-link discord" target="_blank" rel="noopener noreferrer">
                  <div className="discord-icon"></div>
                  <span>Discord Server</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-navigation">
            <h4>Quick Links</h4>
            <nav className="footer-nav">
              {footerLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a key={link.name} href={link.href} className="footer-link">
                    <IconComponent size={16} />
                    {link.name}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="footer-community">
            <h4>Community Stats</h4>
            <div className="community-stats">
              <div className="stat">
                <span className="stat-number">2,847</span>
                <span className="stat-label">Total Members</span>
              </div>
              <div className="stat">
                <span className="stat-number">156</span>
                <span className="stat-label">Online Now</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Server Uptime</span>
              </div>
            </div>
          </div>

          <div className="footer-support">
            <h4>Need Help?</h4>
            <div className="support-info">
              <a href="/contact" className="support-link">
                <Mail size={16} />
                <div>
                  <span className="support-title">Contact Support</span>
                  <span className="support-desc">Get help from our team</span>
                </div>
              </a>
              <a href="/faq" className="support-link">
                <HelpCircle size={16} />
                <div>
                  <span className="support-title">FAQ</span>
                  <span className="support-desc">Quick answers to common questions</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="footer-separator"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-center">
            <div className="center-brand">ProjectTest</div>
            <div className="center-tagline">Powered by passion, driven by community</div>
          </div>
          
          <div className="footer-legal">
            <div className="legal-links">
              {legalLinks.map((link, index) => (
                <a key={index} href={link.href} className="legal-link">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          <div className="footer-copyright">
            <p>
              © 2025 ProjectTest Gaming Community. All rights reserved.
            </p>
            <p className="made-with-love">
              Made with <Heart size={14} className="heart-icon" /> for gamers worldwide
            </p>
          </div>
        </div>

        {/* Cyber Grid Effect */}
        <div className="footer-cyber-grid"></div>
      </div>
    </footer>
  );
};

export default Footer;