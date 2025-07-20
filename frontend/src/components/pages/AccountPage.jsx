import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Navigation from '../Navigation';
import Footer from '../Footer';
import ProtectedRoute from '../ProtectedRoute';
import cs2Service from '../../services/cs2Service';
import { User, Target, Trophy, Users, Camera, Settings, Bell, Eye, Shield } from 'lucide-react';

const AccountPage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: true,
    emailNotifications: false
  });

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || null);
      fetchStats();
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
        // Here you would typically upload to server
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
    // Here you would save settings to server
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
                  <User className="h-6 w-6 text-[var(--accent-primary)]" />
                </div>
                <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                  My Account
                </h1>
              </div>
              <p className="text-lg text-[var(--text-muted)]">
                Manage your profile and view your CS2 performance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Avatar & Profile Section */}
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-[var(--accent-primary)]" />
                  Profile & Avatar
                </h2>

                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                        {avatar ? (
                          <img 
                            src={avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 bg-[var(--accent-primary)] text-black p-2 rounded-full cursor-pointer hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        <Camera className="h-4 w-4" />
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
                      <p className="text-sm text-[var(--accent-primary)]">Uploading...</p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] text-center">
                      Click the camera icon to change your avatar
                    </p>
                  </div>

                  {/* Basic User Info (Read-only) */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Username
                      </label>
                      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]">
                        {user?.username}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]">
                        {user?.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Role
                      </label>
                      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-[var(--accent-bg)] text-[var(--accent-primary)]'
                        }`}>
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CS2 Statistics Section - Minimal */}
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3 mb-6">
                  <Crosshair className="h-6 w-6 text-[var(--accent-primary)]" />
                  CS2 Statistics
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-[var(--bg-tertiary)] rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <p className="text-[var(--text-muted)]">{error}</p>
                ) : stats ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-red-400" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">K/D Ratio</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
                        {stats.stats.kd_ratio || '0.00'}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Win Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
                        {stats.stats.win_rate || 0}%
                      </div>
                    </div>

                    <div className="text-center p-4 bg-[var(--bg-tertiary)] rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">Matches Played</span>
                      </div>
                      <div className="text-3xl font-bold text-[var(--accent-primary)] font-mono">
                        {stats.stats.matches_played || 0}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)]">No CS2 statistics available</p>
                )}

                {/* Link to Full Leaderboard */}
                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href="/leaderboard"
                    className="block w-full text-center px-4 py-3 bg-[var(--accent-primary)] text-black rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    View Full Leaderboard
                  </a>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Account Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Member Since:</span>
                  <div className="font-medium text-[var(--text-primary)]">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Last Login:</span>
                  <div className="font-medium text-[var(--text-primary)]">
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Status:</span>
                  <div className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.is_active 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="mt-8 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3 mb-6">
                <Settings className="h-6 w-6 text-[var(--accent-primary)]" />
                Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-[var(--text-muted)]" />
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">Push Notifications</p>
                        <p className="text-sm text-[var(--text-muted)]">Receive notifications about matches</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-[var(--text-muted)]" />
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">Email Notifications</p>
                        <p className="text-sm text-[var(--text-muted)]">Receive email updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4">Privacy</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-[var(--text-muted)]" />
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">Profile Visibility</p>
                        <p className="text-sm text-[var(--text-muted)]">Make your profile public</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('privacy')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.privacy ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.privacy ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-green-400" />
                      <span className="text-[var(--text-primary)] font-medium">Account Security</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      Your account is secured with JWT authentication
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AccountPage;