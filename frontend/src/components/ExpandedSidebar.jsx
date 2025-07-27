import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, BarChart3, Trophy, Shield, LogOut, ChevronDown,
  Target, Clock, Users
} from 'lucide-react';
import cs2Service from '../services/cs2Service';

const ExpandedSidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const result = await cs2Service.getMyStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load CS2 statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getRankColor = (rank) => {
    const rankColors = {
      'Silver II': '#6B7280',
      'Silver I': '#6B7280',
      'Silver III': '#6B7280',
      'Silver IV': '#6B7280',
      'Silver Elite': '#6B7280',
      'Silver Elite Master': '#6B7280',
      'Gold Nova I': '#F59E0B',
      'Gold Nova II': '#F59E0B',
      'Gold Nova III': '#F59E0B',
      'Gold Nova Master': '#F59E0B',
      'Master Guardian I': '#6366F1',
      'Master Guardian II': '#3B82F6',
      'Master Guardian Elite': '#06B6D4',
      'Distinguished Master Guardian': '#10B981',
      'Legendary Eagle': '#EF4444',
      'Legendary Eagle Master': '#F59E0B',
      'Supreme Master First Class': '#EC4899',
      'Global Elite': '#8B5CF6',
      'Unranked': '#9CA3AF'
    };
    return rankColors[rank] || '#9CA3AF';
  };

  if (!user) {
    return null;
  }

  const playerStats = stats?.stats || {};
  const currentRank = playerStats.current_rank || 'Silver II';
  const kdRatio = playerStats.kd_ratio || '1.23';
  const winRate = playerStats.win_rate || 46;

  return (
    <div className="expanded-sidebar">
      {/* User Profile Section */}
      <div className="sidebar-profile">
        <div className="profile-header">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="profile-button"
          >
            <div className="profile-avatar">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name || user.username}
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-text">
                  {(user.display_name || user.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">
                {user.display_name || user.username}
              </div>
              <div className="profile-role">
                {user.role}
              </div>
            </div>
            <ChevronDown className={`profile-dropdown-arrow ${showProfileDropdown ? 'open' : ''}`} />
          </button>
        </div>

        {showProfileDropdown && (
          <div className="profile-details">
            <div className="profile-email">
              {user.email}
            </div>
            <div className="profile-badges">
              <span className="badge badge-role">
                {user.role}
              </span>
              {user.steam_id && (
                <span className="badge badge-steam">
                  Steam Linked
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CS2 Statistics Section */}
      <div className="cs2-stats-section">
        <div className="cs2-header">
          <Target className="cs2-icon" />
          <span className="cs2-title">CS2</span>
        </div>
        
        <div className="cs2-rank-display">
          <div 
            className="rank-circle"
            style={{ 
              borderColor: getRankColor(currentRank),
              backgroundColor: `${getRankColor(currentRank)}15`
            }}
          >
            <div className="rank-text">
              {currentRank}
            </div>
          </div>
        </div>

        <div className="cs2-stats-grid">
          <div className="stat-item">
            <div className="stat-value">{kdRatio}</div>
            <div className="stat-label">K/D</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">WIN RATE</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-navigation">
        <button
          onClick={() => handleNavigation('/dashboard')}
          className="nav-item"
        >
          <BarChart3 className="nav-icon" />
          <span>Player Dashboard</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/leaderboard')}
          className="nav-item"
        >
          <Trophy className="nav-icon" />
          <span>CS2 Leaderboard</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/account')}
          className="nav-item"
        >
          <User className="nav-icon" />
          <span>Quick Account</span>
        </button>

        {user.role === 'admin' && (
          <button
            onClick={() => handleNavigation('/admin')}
            className="nav-item admin"
          >
            <Shield className="nav-icon" />
            <span>Admin Panel</span>
          </button>
        )}
      </nav>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          <LogOut className="logout-icon" />
          <span>Sign Out</span>
        </button>

        <div className="user-stats">
          <div className="user-stat">
            <div className="stat-number">{user.login_count || 0}</div>
            <div className="stat-text">LOGINS</div>
          </div>
          <div className="user-stat">
            <div className="stat-number">
              {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
            </div>
            <div className="stat-text">LAST LOGIN</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedSidebar;