import React, { useState } from 'react';
import { User, LogIn, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = ({ user, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', href: '/', path: '/' },
    { name: 'Rules', href: '/rules', path: '/rules' },
    { name: 'FAQ', href: '/faq', path: '/faq' },
    { name: 'About', href: '/about', path: '/about' },
    { name: 'Team', href: '/team', path: '/team' },
    { name: 'Contact', href: '/contact', path: '/contact' }
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

          {/* User section */}
          <div className="nav-user">
            {user ? (
              <div className="user-profile">
                <img src={user.avatar} alt="Profile" className="user-avatar" />
                <span className="username">{user.username}</span>
                <button onClick={onLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLoginForm(true)}
                className="login-btn"
              >
                <LogIn size={18} />
                Login / Register
              </button>
            )}
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
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="modal-overlay" onClick={() => setShowLoginForm(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Login to ProjectTest</h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Login</button>
                <button 
                  type="button" 
                  onClick={() => setShowLoginForm(false)}
                  className="btn-secondary"
                >
                  Cancel
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