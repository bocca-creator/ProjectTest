import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Navigation from '../Navigation';
import Footer from '../Footer';
import ProtectedRoute from '../ProtectedRoute';
import cs2Service from '../../services/cs2Service';
import { User, Target, Trophy, Users, Crosshair, Settings, Edit, Save, X } from 'lucide-react';

const AccountPage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        bio: user.bio || ''
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      display_name: user.display_name || '',
      bio: user.bio || ''
    });
    setEditing(false);
  };

  const getRankColor = (rank) => {
    const rankColors = {
      'Global Elite': '#8B5CF6',
      'Supreme Master First Class': '#EC4899',
      'Legendary Eagle Master': '#F59E0B',
      'Legendary Eagle': '#EF4444',
      'Distinguished Master Guardian': '#10B981',
      'Master Guardian Elite': '#06B6D4',
      'Master Guardian II': '#3B82F6',
      'Master Guardian I': '#6366F1',
      'Gold Nova Master': '#F59E0B',
      'Gold Nova III': '#F59E0B',
      'Gold Nova II': '#F59E0B',
      'Gold Nova I': '#F59E0B',
      'Silver Elite Master': '#6B7280',
      'Silver Elite': '#6B7280',
      'Silver IV': '#6B7280',
      'Silver III': '#6B7280',
      'Silver II': '#6B7280',
      'Silver I': '#6B7280',
      'Unranked': '#9CA3AF'
    };
    return rankColors[rank] || '#9CA3AF';
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
              {/* Profile Section */}
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-3">
                    <Settings className="h-6 w-6 text-[var(--accent-primary)]" />
                    Profile Information
                  </h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Username (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Username
                    </label>
                    <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
                      {user?.username}
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Email
                    </label>
                    <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
                      {user?.email}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Display Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                        placeholder="Enter display name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]">
                        {user?.display_name || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                        placeholder="Tell us about yourself"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] min-h-[80px]">
                        {user?.bio || 'No bio added yet'}
                      </div>
                    )}
                  </div>

                  {/* Role */}
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

                  {/* Edit Actions */}
                  {editing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updating}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4" />
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
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
                  {/* Minimal Essential Stats Only */}
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