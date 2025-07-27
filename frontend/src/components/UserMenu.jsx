import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Trophy, Target, BarChart3, Shield } from 'lucide-react';
import CS2StatsCard from './CS2StatsCard';
import CS2LeaderboardModal from './CS2LeaderboardModal';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] transition-colors"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-black font-medium">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.display_name || user.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {user.display_name || user.username}
          </p>
          <p className="text-xs text-[var(--text-muted)] capitalize">
            {user.role}
          </p>
        </div>
        
        <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="user-menu-dropdown">
            {/* User Info Header */}
            <div className="user-menu-header">
              <div className="user-menu-profile">
                <div className="user-menu-avatar">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="user-menu-info">
                  <div className="user-menu-name">
                    {user.display_name || user.username}
                  </div>
                  <div className="user-menu-email">
                    {user.email}
                  </div>
                  <div className="user-menu-badges">
                    <span className="user-menu-badge badge-role">
                      {user.role}
                    </span>
                    {user.steam_id && (
                      <span className="user-menu-badge badge-steam">
                        Steam Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CS2 Statistics */}
            <div className="user-menu-stats">
              <CS2StatsCard isCompact={true} />
            </div>

            {/* Menu Items */}
            <div className="user-menu-navigation">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard');
                }}
                className="user-menu-item"
              >
                <BarChart3 />
                <span>Player Dashboard</span>
              </button>
              
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                  setIsOpen(false);
                }}
                className="user-menu-item"
              >
                <Trophy />
                <span>CS2 Leaderboard</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/account');
                }}
                className="user-menu-item"
              >
                <User />
                <span>Quick Account</span>
              </button>

              {/* Admin Panel - Only show for admin users */}
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/admin');
                  }}
                  className="user-menu-item admin"
                >
                  <Shield />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="user-menu-footer">
              <button
                onClick={handleLogout}
                className="user-menu-logout"
              >
                <LogOut />
                <span>{t('auth.signOut', 'Sign Out')}</span>
              </button>
            </div>

            {/* User Stats */}
            <div className="user-menu-user-stats">
              <div className="user-stats-grid">
                <div className="user-stat-item">
                  <div className="user-stat-value">
                    {user.login_count || 0}
                  </div>
                  <div className="user-stat-label">
                    {t('user.logins', 'Logins')}
                  </div>
                </div>
                <div className="user-stat-item">
                  <div className="user-stat-value">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="user-stat-label">
                    {t('user.lastLogin', 'Last Login')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CS2 Leaderboard Modal */}
      <CS2LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
};

export default UserMenu;