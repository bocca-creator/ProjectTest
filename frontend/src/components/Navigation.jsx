import React, { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();

  const menuItems = [
    { name: t('nav.home'), href: '/', path: '/' },
    { name: t('nav.rules'), href: '/rules', path: '/rules' },
    { name: t('nav.faq'), href: '/faq', path: '/faq' },
    { name: t('nav.about'), href: '/about', path: '/about' },
    { name: t('nav.team'), href: '/team', path: '/team' },
    { name: t('nav.contact'), href: '/contact', path: '/contact' }
  ];

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

          {/* Right section - Controls and User */}
          <div className="nav-right">
            {/* Theme and Language controls - now properly positioned */}
            <div className="nav-controls">
              <LanguageSwitcher className="desktop-language-switcher" />
              <ThemeSwitcher className="desktop-theme-switcher" />
            </div>
            
            {/* User section */}
            <div className="nav-user">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : isAuthenticated && user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="login-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black font-medium transition-colors"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">
                    {t('nav.login')} / {t('nav.register')}
                  </span>
                  <span className="sm:hidden">
                    {t('nav.login')}
                  </span>
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
            
            {/* Mobile Controls Section */}
            <div className="mobile-controls-section">
              <div className="mobile-control-group">
                <div className="mobile-control-label">{t('settings.language')}</div>
                <LanguageSwitcher className="mobile-language-switcher" />
              </div>
              
              <div className="mobile-control-group">
                <div className="mobile-control-label">{t('settings.theme')}</div>
                <ThemeSwitcher className="mobile-theme-switcher" />
              </div>
            </div>

            {/* Mobile Authentication */}
            {!isAuthenticated && (
              <div className="mobile-auth-section p-4 border-t border-[var(--border-subtle)]">
                <button 
                  onClick={() => {
                    setAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black font-medium transition-colors"
                >
                  <LogIn size={18} />
                  {t('nav.login')} / {t('nav.register')}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </>
  );
};

export default Navigation;