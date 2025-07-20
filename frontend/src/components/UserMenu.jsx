import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Trophy, Target, BarChart3 } from 'lucide-react';
import CS2StatsCard from './CS2StatsCard';
import CS2LeaderboardModal from './CS2LeaderboardModal';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
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
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
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
          <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50">
            {/* User Info Header */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-black font-medium">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {(user.display_name || user.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent-primary)] capitalize">
                      {user.role}
                    </span>
                    {user.steam_id && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        Steam Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CS2 Statistics */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <CS2StatsCard isCompact={true} />
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Open profile settings
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <User className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-primary)]">
                  {t('user.profile', 'Profile Settings')}
                </span>
              </button>
              
              <button
                onClick={() => {
                  setShowLeaderboard(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Trophy className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-primary)]">
                  CS2 Leaderboard
                </span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Open account settings
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Settings className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-[var(--text-primary)]">
                  {t('user.accountSettings', 'Account Settings')}
                </span>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-[var(--border-subtle)] py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--error)]/10 transition-colors group"
              >
                <LogOut className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--error)]" />
                <span className="text-[var(--text-primary)] group-hover:text-[var(--error)]">
                  {t('auth.signOut', 'Sign Out')}
                </span>
              </button>
            </div>

            {/* User Stats */}
            <div className="border-t border-[var(--border-subtle)] p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-[var(--accent-primary)]">
                    {user.login_count || 0}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('user.logins', 'Logins')}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent-primary)]">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('user.lastLogin', 'Last Login')}
                  </p>
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