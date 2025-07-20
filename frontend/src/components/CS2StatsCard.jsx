import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import cs2Service from '../services/cs2Service';
import { Target, Trophy, TrendingUp, Award, Clock, Users, Crosshair, Shield } from 'lucide-react';

const CS2StatsCard = ({ userId = null, isCompact = false }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchStats();
    }
  }, [targetUserId]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = userId 
        ? await cs2Service.getUserStats(userId)
        : await cs2Service.getMyStats();
        
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

  const getStreakIcon = (streakType) => {
    switch (streakType) {
      case 'win': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'loss': return <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />;
      default: return <TrendingUp className="h-3 w-3 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Crosshair className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-[var(--text-primary)] font-medium">CS2 Statistics</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-[var(--bg-tertiary)] rounded w-12 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Crosshair className="h-5 w-5 text-[var(--accent-primary)]" />
          <h3 className="text-[var(--text-primary)] font-medium">CS2 Statistics</h3>
        </div>
        <p className="text-[var(--text-muted)] text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const playerStats = stats.stats;

  if (isCompact) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">CS2</span>
          </div>
          <div 
            className="text-xs px-2 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: getRankColor(playerStats.current_rank) }}
          >
            {playerStats.current_rank}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-[var(--accent-primary)] font-mono">
              {playerStats.kd_ratio || '0.00'}
            </div>
            <div className="text-xs text-[var(--text-muted)]">K/D</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--accent-primary)] font-mono">
              {playerStats.win_rate || 0}%
            </div>
            <div className="text-xs text-[var(--text-muted)]">Win Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--accent-primary)] font-mono">
              {playerStats.matches_played || 0}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Matches</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[var(--accent-bg)] rounded-lg flex items-center justify-center">
            <Crosshair className="h-5 w-5 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">CS2 Statistics</h3>
            <p className="text-sm text-[var(--text-muted)]">{stats.username}</p>
          </div>
        </div>
        
        {/* Current Rank */}
        <div className="text-center">
          <div 
            className="px-3 py-1 rounded-full text-white font-medium text-sm mb-1"
            style={{ backgroundColor: getRankColor(playerStats.current_rank) }}
          >
            {playerStats.current_rank}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {playerStats.rank_rating?.toLocaleString()} RR
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono mb-1">
            {playerStats.kd_ratio || '0.00'}
          </div>
          <div className="text-sm text-[var(--text-muted)]">K/D Ratio</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {playerStats.total_kills || 0}K / {playerStats.total_deaths || 0}D
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono mb-1">
            {playerStats.win_rate || 0}%
          </div>
          <div className="text-sm text-[var(--text-muted)]">Win Rate</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {playerStats.matches_won || 0}W / {playerStats.matches_lost || 0}L
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono mb-1">
            {playerStats.headshot_percentage || 0}%
          </div>
          <div className="text-sm text-[var(--text-muted)]">HS %</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Headshots
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono mb-1">
            {playerStats.adr || 0}
          </div>
          <div className="text-sm text-[var(--text-muted)]">ADR</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            Avg Damage
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--accent-primary)]" />
            Performance
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">Matches Played</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.matches_played || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">MVP Count</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.mvp_count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">Average Score</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.average_score || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--accent-primary)]" />
            Advanced Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">KAST</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.kast || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">Clutch Rate</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.clutch_attempts > 0 
                  ? Math.round((playerStats.clutch_wins / playerStats.clutch_attempts) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">First Kills</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">
                {playerStats.first_kills || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Streak and Playtime */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          {getStreakIcon(playerStats.streak_type)}
          <span className="text-sm text-[var(--text-muted)]">
            {playerStats.current_streak > 0 
              ? `${Math.abs(playerStats.current_streak)} ${playerStats.streak_type} streak`
              : 'No active streak'
            }
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-muted)]">
            {playerStats.total_playtime_hours || 0}h played
          </span>
        </div>
      </div>

      {/* Favorite Map */}
      {playerStats.favorite_map && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">Favorite Map</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {playerStats.favorite_map.replace('de_', '').charAt(0).toUpperCase() + 
               playerStats.favorite_map.replace('de_', '').slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Last Match */}
      {playerStats.last_match_date && (
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">Last Match</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {new Date(playerStats.last_match_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CS2StatsCard;