import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, BarChart3, Settings, Activity, Shield, 
  Crown, Trophy, AlertCircle, RefreshCw, Search,
  ChevronDown, ChevronUp, Edit, Trash2, UserX,
  Eye, EyeOff
} from 'lucide-react';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userFilters, setUserFilters] = useState({
    role: '',
    search: '',
    page: 1,
    limit: 20
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch data on component mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (activeTab === 'dashboard' || activeTab === 'users') {
        await fetchDashboardStats();
      }
      
      if (activeTab === 'users') {
        await fetchUsers();
      }
      
      if (activeTab === 'matches') {
        await fetchRecentMatches();
      }
      
      if (activeTab === 'logs') {
        await fetchActivityLogs();
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: userFilters.page,
        limit: userFilters.limit,
        ...(userFilters.role && { role: userFilters.role }),
        ...(userFilters.search && { search: userFilters.search })
      });
      
      const response = await axios.get(`${API_URL}/api/admin/users?${params}`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/matches/recent?limit=50`, {
        headers: getAuthHeaders()
      });
      setRecentMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/activity-logs?limit=100`, {
        headers: getAuthHeaders()
      });
      setActivityLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  // Refresh data
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [activeTab, userFilters]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: getAuthHeaders() }
      );
      
      // Refresh users list
      fetchUsers();
      
      // Show success message (you can implement toast notifications)
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { is_active: isActive, reason: isActive ? 'Reactivated by admin' : 'Deactivated by admin' },
        { headers: getAuthHeaders() }
      );
      
      // Refresh users list
      fetchUsers();
      
      alert(isActive ? 'User account activated!' : 'User account deactivated!');
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const assignUserTier = async (userId, tier) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/tier`,
        { 
          tier: tier,
          notes: `Assigned ${tier} tier by admin`
        },
        { headers: getAuthHeaders() }
      );
      
      // Refresh users list
      fetchUsers();
      
      alert(`${tier} tier assigned successfully!`);
    } catch (error) {
      console.error('Error assigning tier:', error);
      alert('Failed to assign tier');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(
        `${API_URL}/api/admin/users/${userId}`,
        { headers: getAuthHeaders() }
      );
      
      // Refresh users list
      fetchUsers();
      
      alert('User account deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user account');
    }
  };

  // Show loading or redirect for non-admin users
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-primary)]">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center text-[var(--text-primary)]">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--error)]" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--text-muted)]">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[var(--accent-primary)]" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchData()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-secondary)] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              <button
                onClick={() => handleTabChange('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'dashboard' ? 'bg-[var(--accent-primary)] text-black' : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Dashboard
              </button>
              
              <button
                onClick={() => handleTabChange('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'users' ? 'bg-[var(--accent-primary)] text-black' : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Users className="w-5 h-5" />
                User Management
              </button>
              
              <button
                onClick={() => handleTabChange('matches')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'matches' ? 'bg-[var(--accent-primary)] text-black' : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Trophy className="w-5 h-5" />
                Match Control
              </button>
              
              <button
                onClick={() => handleTabChange('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'logs' ? 'bg-[var(--accent-primary)] text-black' : 'hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Activity className="w-5 h-5" />
                Activity Logs
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
                <div className="flex items-center gap-2 text-[var(--error)]">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <DashboardTab stats={dashboardStats} isLoading={isLoading} />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                isLoading={isLoading}
                filters={userFilters}
                setFilters={setUserFilters}
                onUpdateRole={updateUserRole}
                onUpdateStatus={updateUserStatus}
                onAssignTier={assignUserTier}
                onDeleteUser={deleteUser}
              />
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <MatchesTab matches={recentMatches} isLoading={isLoading} />
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'logs' && (
              <ActivityLogsTab logs={activityLogs} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-[var(--bg-tertiary)] rounded mb-4"></div>
            <div className="h-8 bg-[var(--bg-tertiary)] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Total Users</p>
                <p className="text-3xl font-bold text-[var(--accent-primary)]">
                  {stats.total_users}
                </p>
              </div>
              <Users className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>
          </div>

          {/* Active Players */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Active Players</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.active_players}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Matches Tracked */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Matches Tracked</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.matches_tracked.toLocaleString()}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Leaderboard Status */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm">Leaderboard Status</p>
                <p className="text-lg font-bold text-[var(--accent-primary)] capitalize">
                  {stats.leaderboard_status}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-[var(--accent-primary)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Donation Statistics */}
      <div>
        <h3 className="text-xl font-bold mb-4">Donation Statistics</h3>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)]">
          {Object.keys(stats.donation_stats).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.donation_stats).map(([tier, data]) => (
                <div key={tier} className="text-center">
                  <Crown className="w-6 h-6 mx-auto mb-2 text-[var(--accent-primary)]" />
                  <p className="text-sm text-[var(--text-muted)] capitalize">{tier}</p>
                  <p className="font-bold">{data.count} purchases</p>
                  <p className="text-xs text-green-400">${data.total_amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-center py-4">
              No donation data available yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, isLoading, filters, setFilters, onUpdateRole, onUpdateStatus, onAssignTier, onDeleteUser }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="text-[var(--text-muted)]">
          {users.users && `${users.users.length} of ${users.total_count} users`}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
        
        <select
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
          className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="member">Member</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.users && users.users.length > 0 ? (
        <div className="space-y-4">
          {users.users.map((user) => (
            <UserManagementCard
              key={user.id}
              user={user}
              onUpdateRole={onUpdateRole}
              onUpdateStatus={onUpdateStatus}
              onAssignTier={onAssignTier}
              onDeleteUser={onDeleteUser}
            />
          ))}
          
          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-[var(--text-muted)]">
              Page {users.page} of {users.total_pages}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(users.page - 1)}
                disabled={users.page <= 1}
                className="px-3 py-2 rounded-lg border border-[var(--border-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)]"
              >
                Previous
              </button>
              
              <button
                onClick={() => handlePageChange(users.page + 1)}
                disabled={users.page >= users.total_pages}
                className="px-3 py-2 rounded-lg border border-[var(--border-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-tertiary)]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No users found</p>
        </div>
      )}
    </div>
  );
};

// User Management Card Component
const UserManagementCard = ({ user, onUpdateRole, onUpdateStatus, onAssignTier, onDeleteUser }) => {
  const [showActions, setShowActions] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'member': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'banned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-[var(--accent-bg)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30';
    }
  };

  const getTierBadgeColor = (tier) => {
    if (!tier) return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'silver': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'platinum': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'diamond': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'elite': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-primary)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-black font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-[var(--text-primary)]">{user.username}</h3>
              <span className={`px-2 py-1 rounded-md text-xs border ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              {user.current_tier && (
                <span className={`px-2 py-1 rounded-md text-xs border ${getTierBadgeColor(user.current_tier.tier)}`}>
                  {user.current_tier.tier}
                </span>
              )}
              {!user.is_active && (
                <span className="px-2 py-1 rounded-md text-xs border bg-red-500/20 text-red-400 border-red-500/30">
                  Inactive
                </span>
              )}
            </div>
            
            <div className="text-sm text-[var(--text-muted)]">
              <p>{user.email}</p>
              <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {showActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-10">
              <div className="p-2 space-y-1">
                {/* Role Management */}
                <div className="text-xs font-bold text-[var(--text-muted)] px-2 py-1 border-b border-[var(--border-subtle)]">
                  Role Management
                </div>
                
                {['admin', 'moderator', 'member', 'banned'].map((role) => (
                  role !== user.role && (
                    <button
                      key={role}
                      onClick={() => onUpdateRole(user.id, role)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-sm capitalize"
                    >
                      Make {role}
                    </button>
                  )
                ))}
                
                {/* Tier Assignment */}
                <div className="text-xs font-bold text-[var(--text-muted)] px-2 py-1 border-b border-[var(--border-subtle)] mt-2">
                  Assign Tier
                </div>
                
                {['bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => onAssignTier(user.id, tier)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-sm capitalize"
                  >
                    <Crown className="w-3 h-3 inline mr-2" />
                    {tier}
                  </button>
                ))}
                
                {/* Account Management */}
                <div className="text-xs font-bold text-[var(--text-muted)] px-2 py-1 border-b border-[var(--border-subtle)] mt-2">
                  Account Management
                </div>
                
                <button
                  onClick={() => onUpdateStatus(user.id, !user.is_active)}
                  className={`w-full text-left px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-sm flex items-center gap-2 ${
                    user.is_active ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {user.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {user.is_active ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="w-full text-left px-2 py-1 rounded hover:bg-[var(--bg-tertiary)] text-sm text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Matches Tab Component
const MatchesTab = ({ matches, isLoading }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recent Matches</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-[var(--bg-tertiary)] rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div key={match.id || index} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-primary)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Result Badge */}
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    match.result === 'win' ? 'bg-green-500/20 text-green-400' :
                    match.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {match.result.toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{match.username}</span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span className="text-[var(--text-primary)]">{match.map}</span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {match.kills}K / {match.deaths}D / {match.assists}A
                      {match.is_mvp && <span className="ml-2 text-yellow-400">★ MVP</span>}
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-[var(--text-muted)]">
                  {new Date(match.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No recent matches found</p>
        </div>
      )}
    </div>
  );
};

// Activity Logs Tab Component
const ActivityLogsTab = ({ logs, isLoading }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Activity Logs</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2"></div>
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div key={log.id || index} className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-primary)]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-[var(--accent-primary)]">{log.admin_username}</span>
                    <span className="px-2 py-1 rounded-md text-xs bg-[var(--accent-bg)] text-[var(--accent-primary)]">
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-[var(--text-muted)] text-sm capitalize">
                      {log.target_type}: {log.target_id}
                    </span>
                  </div>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-sm text-[var(--text-muted)]">
                      {Object.entries(log.details).map(([key, value]) => (
                        <span key={key} className="mr-4">
                          {key}: <span className="text-[var(--text-primary)]">{String(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right text-sm text-[var(--text-muted)]">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No activity logs found</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;