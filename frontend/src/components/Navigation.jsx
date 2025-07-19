import React, { useState } from 'react';
import { User, LogIn, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const Navigation = ({ user, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { name: t('nav.home'), href: '/', path: '/' },
    { name: t('nav.rules'), href: '/rules', path: '/rules' },
    { name: t('nav.faq'), href: '/faq', path: '/faq' },
    { name: t('nav.about'), href: '/about', path: '/about' },
    { name: t('nav.team'), href: '/team', path: '/team' },
    { name: t('nav.contact'), href: '/contact', path: '/contact' }
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      onLogin({
        username: loginForm.username,
        id: Date.now(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginForm.username}`
      });
      setLoginForm({ username: '', password: '' });
      setShowLoginForm(false);
    }
  };

  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-text">ProjectTest</div>
            <div className="logo-subtitle">Gaming Community</div>
          </div>

          {/* Desktop menu */}
          <div className="nav-menu desktop-menu">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(item.path, e)}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Right section - Language Switcher, Theme Switcher and User */}
          <div className="nav-right">
            <LanguageSwitcher className="desktop-language-switcher" />
            <ThemeSwitcher className="desktop-theme-switcher" />
            
            <div className="nav-user">
              {user ? (
                <div className="user-profile">
                  <img src={user.avatar} alt="Profile" className="user-avatar" />
                  <span className="username">{user.username}</span>
                  <button onClick={onLogout} className="logout-btn">
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginForm(true)}
                  className="login-btn"
                >
                  <LogIn size={18} />
                  {t('nav.login')} / {t('nav.register')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavigation(item.path, e)}
                className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </a>
            ))}
            
            {/* Mobile Language Switcher */}
            <div className="mobile-controls-section">
              <div className="mobile-control-group">
                <div className="mobile-control-label">{t('settings.language')}</div>
                <LanguageSwitcher className="mobile-language-switcher" />
              </div>
              
              {/* Mobile Theme Switcher */}
              <div className="mobile-control-group">
                <div className="mobile-control-label">{t('settings.theme')}</div>
                <ThemeSwitcher className="mobile-theme-switcher" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="modal-overlay" onClick={() => setShowLoginForm(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t('auth.loginTitle')}</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder={t('auth.username')}
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder={t('auth.password')}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{t('auth.loginButton')}</button>
                <button 
                  type="button" 
                  onClick={() => setShowLoginForm(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;