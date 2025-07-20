import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from './Navigation';
import Footer from './Footer';
import ProtectedRoute from './ProtectedRoute';
import cs2Service from '../services/cs2Service';
import { 
  User, Target, Trophy, Users, Camera, Settings, Bell, Eye, Shield, 
  Calendar, Clock, Crosshair, Skull, Award, Activity, Gamepad2,
  Edit3, Mail, Globe, Palette, Trash2, Save, X, ChevronRight,
  BarChart3, History, UserCog, AlertTriangle
} from 'lucide-react';

const PlayerDashboard = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  
  // Settings states
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: true,
    emailNotifications: false,
    language: 'english',
    theme: 'dark-neon'
  });
  
  // Edit states
  const [editing, setEditing] = useState({
    username: false,
    email: false,
    steamId: false
  });
  
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    steamId: user?.steam_id || ''
  });

  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || null);
      setEditData({
        username: user.username || '',
        email: user.email || '',
        steamId: user.steam_id || ''
      });
      fetchStats();
      fetchRecentMatches();
    }
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cs2Service.getMyStats();
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load CS2 statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      // Mock recent matches data
      setRecentMatches([
        { id: 1, map: 'Dust 2', result: 'Win', kd: '24/12', date: '2025-01-20', score: '16-14' },
        { id: 2, map: 'Mirage', result: 'Loss', kd: '18/20', date: '2025-01-19', score: '12-16' },
        { id: 3, map: 'Inferno', result: 'Win', kd: '31/15', date: '2025-01-18', score: '16-10' },
        { id: 4, map: 'Overpass', result: 'Win', kd: '22/18', date: '2025-01-17', score: '16-13' },
        { id: 5, map: 'Cache', result: 'Loss', kd: '16/21', date: '2025-01-16', score: '13-16' }
      ]);
    } catch (err) {
      console.error('Failed to fetch recent matches:', err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
        updateAvatarOnServer(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAvatarOnServer = async (avatarData) => {
    setUploading(true);
    try {
      const result = await updateProfile({ avatar: avatarData });
      if (!result.success) {
        setError(result.error || 'Failed to update avatar');
      }
    } catch (err) {
      setError('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleEdit = (field, value) => {
    setEditing(prev => ({ ...prev, [field]: value }));
    if (!value) {
      // Reset to original value on cancel
      setEditData(prev => ({
        ...prev,
        [field]: field === 'username' ? user?.username || '' :
                field === 'email' ? user?.email || '' :
                user?.steam_id || ''
      }));
    }
  };

  const handleSaveEdit = async (field) => {
    try {
      const result = await updateProfile({ [field]: editData[field] });
      if (result.success) {
        setEditing(prev => ({ ...prev, [field]: false }));
      } else {
        setError(result.error || `Failed to update ${field}`);
      }
    } catch (err) {
      setError(`Failed to update ${field}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const result = await deleteAccount();
        if (result.success) {
          // User will be logged out automatically
        } else {
          setError(result.error || 'Failed to delete account');
        }
      } catch (err) {
        setError('Failed to delete account');
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Player Overview', icon: BarChart3 },
    { id: 'account', label: 'Account Info', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'history', label: 'Match History', icon: History }
  ];

  const renderStatsOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* K/D Ratio */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-red-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">K/D Ratio</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '-.--' : stats?.stats?.kd_ratio || '0.00'}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Win Rate</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '--%' : `${stats?.stats?.win_rate || 0}%`}
          </div>
        </div>

        {/* Total Kills */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Crosshair className="h-8 w-8 text-green-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Total Kills</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '---' : stats?.stats?.total_kills || '0'}
          </div>
        </div>

        {/* Headshot % */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Skull className="h-8 w-8 text-orange-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Headshot %</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '--%' : `${stats?.stats?.headshot_percentage || 0}%`}
          </div>
        </div>

        {/* MVP Count */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 text-purple-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">MVP Count</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '---' : stats?.stats?.mvp_count || '0'}
          </div>
        </div>

        {/* Matches Played */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Matches</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '---' : stats?.stats?.matches_played || '0'}
          </div>
        </div>

        {/* Time Played */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-indigo-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Time Played</span>
          </div>
          <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
            {loading ? '---h' : `${stats?.stats?.time_played || 0}h`}
          </div>
        </div>

        {/* Rank Badge */}
        <div className="bg-[var(--bg-tertiary)] rounded-xl p-6 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-cyan-400" />
            <span className="text-sm font-medium text-[var(--text-muted)]">Current Rank</span>
          </div>
          <div className="text-xl font-bold text-[var(--accent-primary)]">
            {loading ? '---' : stats?.stats?.current_rank || 'Unranked'}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-3">
          <History className="h-6 w-6 text-[var(--accent-primary)]" />
          Recent Match Performance
        </h3>
        
        {error ? (
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-[var(--text-muted)] mb-2">Unable to load statistics</p>
            <p className="text-sm text-[var(--text-muted)]">{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMatches.slice(0, 3).map((match) => (
              <div key={match.id} className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-[var(--text-primary)]">{match.map}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    match.result === 'Win' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {match.result}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  <p>K/D: {match.kd}</p>
                  <p>Score: {match.score}</p>
                  <p>{match.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAccountInfo = () => (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <User className="h-6 w-6 text-[var(--accent-primary)]" />
          Profile Information
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-[var(--bg-tertiary)] border-4 border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-[var(--text-muted)]" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-2 right-2 bg-[var(--accent-primary)] text-black p-3 rounded-full cursor-pointer hover:bg-[var(--accent-hover)] transition-colors shadow-lg"
              >
                <Camera className="h-5 w-5" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <p className="text-sm text-[var(--accent-primary)]">Uploading avatar...</p>
            )}
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Username
              </label>
              {editing.username ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    onClick={() => handleSaveEdit('username')}
                    className="px-3 py-3 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit('username', false)}
                    className="px-3 py-3 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">{user?.username}</span>
                  <button
                    onClick={() => handleEdit('username', true)}
                    className="p-1 hover:bg-[var(--bg-primary)] rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              {editing.email ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    onClick={() => handleSaveEdit('email')}
                    className="px-3 py-3 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit('email', false)}
                    className="px-3 py-3 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                  <span className="text-[var(--text-primary)]">{user?.email}</span>
                  <button
                    onClick={() => handleEdit('email', true)}
                    className="p-1 hover:bg-[var(--bg-primary)] rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              )}
            </div>

            {/* Steam ID */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Steam ID (Optional)
              </label>
              {editing.steamId ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.steamId}
                    onChange={(e) => setEditData(prev => ({ ...prev, steamId: e.target.value }))}
                    placeholder="Enter Steam ID"
                    className="flex-1 px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    onClick={() => handleSaveEdit('steamId')}
                    className="px-3 py-3 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit('steamId', false)}
                    className="px-3 py-3 bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Steam className="h-4 w-4 text-blue-400" />
                    <span className="text-[var(--text-primary)]">
                      {user?.steam_id || 'Not linked'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEdit('steamId', true)}
                    className="p-1 hover:bg-[var(--bg-primary)] rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--accent-primary)]">
                  {user?.login_count || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Total Logins</p>
              </div>
              <div className="text-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-lg font-bold text-[var(--accent-primary)]">
                  {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Last Login</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Player Settings */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <UserCog className="h-6 w-6 text-[var(--accent-primary)]" />
          Player Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Notifications
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Push Notifications</p>
                    <p className="text-sm text-[var(--text-muted)]">Get notified about match updates</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-[var(--accent-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Email Notifications</p>
                    <p className="text-sm text-[var(--text-muted)]">Receive updates via email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-[var(--accent-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              Preferences
            </h4>
            
            <div className="space-y-3">
              {/* Language Preference */}
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-5 w-5 text-[var(--accent-primary)]" />
                  <label className="text-[var(--text-primary)] font-medium">Language</label>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="english">English</option>
                  <option value="ukrainian">Ukrainian</option>
                </select>
              </div>

              {/* Theme Selector */}
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="h-5 w-5 text-[var(--accent-primary)]" />
                  <label className="text-[var(--text-primary)] font-medium">Theme</label>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="dark-neon">Dark Neon</option>
                  <option value="light">Light</option>
                </select>
              </div>

              {/* Privacy */}
              <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-[var(--accent-primary)]" />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Profile Visibility</p>
                    <p className="text-sm text-[var(--text-muted)]">Make your profile visible to others</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSettingChange('privacy')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.privacy ? 'bg-[var(--accent-primary)]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.privacy ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Security</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-[var(--text-primary)] font-medium">Account Security</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                Your account is protected with JWT authentication
              </p>
              <div className="text-xs text-green-400">
                ✓ Secure authentication enabled
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Trash2 className="h-5 w-5 text-red-400" />
                <span className="text-[var(--text-primary)] font-medium">Danger Zone</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-3">
                Permanently delete your account and all data
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMatchHistory = () => (
    <div className="space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-3">
          <History className="h-6 w-6 text-[var(--accent-primary)]" />
          Recent Match History
        </h3>

        <div className="space-y-3">
          {recentMatches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  match.result === 'Win' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{match.map}</p>
                  <p className="text-sm text-[var(--text-muted)]">{match.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-[var(--text-muted)]">Score</p>
                  <p className="font-mono text-[var(--text-primary)]">{match.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-[var(--text-muted)]">K/D</p>
                  <p className="font-mono text-[var(--text-primary)]">{match.kd}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  match.result === 'Win' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {match.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-[var(--accent-primary)] text-black rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors">
            Load More Matches
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderStatsOverview();
      case 'account':
        return renderAccountInfo();
      case 'settings':
        return renderSettings();
      case 'history':
        return renderMatchHistory();
      default:
        return renderStatsOverview();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Navigation />
        
        <main className="main-content pt-20">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-12 w-12 bg-[var(--accent-bg)] rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-[var(--accent-primary)]" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                  Player Dashboard
                </h1>
              </div>
              <p className="text-lg text-[var(--text-muted)]">
                Complete overview of your CS2 performance and account settings
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-center gap-2 p-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[var(--accent-primary)] text-black'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:block">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {renderTabContent()}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-center">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 mx-auto block px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default PlayerDashboard;