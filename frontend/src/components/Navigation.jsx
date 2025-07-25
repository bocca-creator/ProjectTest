import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Menu, X, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();

  const menuItems = [
    { name: t('nav.home'), href: '/', path: '/' },
    { name: t('nav.leaderboard'), href: '/leaderboard', path: '/leaderboard' },
    { name: t('nav.supportUs'), href: '/ranks', path: '/ranks' },
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
    setIsDesktopMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDesktopMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDesktopMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          {/* Left section - Logo */}
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-text">ProjectTest</div>
            <div className="logo-subtitle">CS2 Game Servers</div>
          </div>

          {/* Center section - Desktop dropdown menu button */}
          <div className="nav-center">
            <div className="desktop-menu-wrapper" ref={menuRef}>
              <button 
                className="desktop-menu-btn"
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
              >
                <Menu size={20} />
                <span>{t('nav.menu')}</span>
                <ChevronDown 
                  size={16} 
                  className={`dropdown-arrow ${isDesktopMenuOpen ? 'open' : ''}`}
                />
              </button>

              {/* Desktop dropdown menu */}
              {isDesktopMenuOpen && (
                <>
                  <div className="menu-overlay" onClick={() => setIsDesktopMenuOpen(false)}></div>
                  <div className="desktop-dropdown-menu">
                    <div className="dropdown-header">
                      <h3>{t('nav.navigation')}</h3>
                      <button 
                        className="dropdown-close"
                        onClick={() => setIsDesktopMenuOpen(false)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="dropdown-items">
                      {menuItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => handleNavigation(item.path, e)}
                          className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right section - Controls and User */}
          <div className="nav-right">
            {/* Theme and Language controls */}
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

            {/* Mobile menu button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile slide menu from left */}
        {isMenuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
            <div className="mobile-slide-menu">
              <div className="mobile-menu-header">
                <div className="mobile-logo">
                  <div className="logo-text">ProjectTest</div>
                  <div className="logo-subtitle">CS2 Game Servers</div>
                </div>
                <button 
                  className="mobile-menu-close"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mobile-menu-items">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.path, e)}
                    className={`mobile-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              
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
                <div className="mobile-auth-section">
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
          </>
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