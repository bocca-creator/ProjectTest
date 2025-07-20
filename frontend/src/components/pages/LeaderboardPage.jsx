import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from '../Navigation';
import Footer from '../Footer';
import cs2Service from '../../services/cs2Service';
import { Trophy, Target, Award, TrendingUp, Users, Medal, Crown, Loader, RefreshCw } from 'lucide-react';

const LeaderboardPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStat, setSelectedStat] = useState('kd_ratio');
  const [error, setError] = useState(null);

  const statTypes = [
    { value: 'kd_ratio', label: 'K/D Ratio', icon: <Target className="h-5 w-5" />, color: 'text-red-400' },
    { value: 'win_rate', label: 'Win Rate', icon: <Trophy className="h-5 w-5" />, color: 'text-yellow-400' },
    { value: 'total_kills', label: 'Total Kills', icon: <Award className="h-5 w-5" />, color: 'text-purple-400' },
    { value: 'headshot_percentage', label: 'Headshot %', icon: <Target className="h-5 w-5" />, color: 'text-orange-400' },
    { value: 'matches_played', label: 'Matches Played', icon: <Users className="h-5 w-5" />, color: 'text-blue-400' },
    { value: 'mvp_count', label: 'MVP Count', icon: <Crown className="h-5 w-5" />, color: 'text-amber-400' },
    { value: 'adr', label: 'ADR', icon: <TrendingUp className="h-5 w-5" />, color: 'text-green-400' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedStat]);

  const fetchLeaderboard = async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const result = await cs2Service.getLeaderboard(selectedStat, 100);
      if (result.success) {
        setLeaderboard(result.data.leaderboard || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-300" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return (
        <div className="h-6 w-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <span className="text-sm font-bold text-[var(--text-primary)]">{rank}</span>
        </div>
      );
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30 shadow-lg shadow-yellow-400/20';
      case 2: return 'bg-gradient-to-r from-gray-300/10 to-gray-500/10 border-gray-300/30 shadow-lg shadow-gray-300/20';
      case 3: return 'bg-gradient-to-r from-amber-600/10 to-amber-800/10 border-amber-600/30 shadow-lg shadow-amber-600/20';
      default: return 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]';
    }
  };

  const formatStatValue = (value, statType) => {
    switch (statType) {
      case 'kd_ratio':
        return typeof value === 'number' ? value.toFixed(2) : '0.00';
      case 'win_rate':
      case 'headshot_percentage':
        return `${typeof value === 'number' ? value.toFixed(1) : '0.0'}%`;
      case 'adr':
        return typeof value === 'number' ? value.toFixed(1) : '0.0';
      default:
        return typeof value === 'number' ? value.toLocaleString() : '0';
    }
  };

  const getCurrentStatInfo = () => {
    return statTypes.find(stat => stat.value === selectedStat) || statTypes[0];
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navigation />
      
      <main className="main-content pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 bg-[var(--accent-bg)] rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-[var(--accent-primary)]" />
              </div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                CS2 Leaderboard
              </h1>
            </div>
            <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              Compete with the best players and climb to the top of the rankings
            </p>
          </div>

          {/* Stat Type Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {statTypes.map((stat) => (
                <button
                  key={stat.value}
                  onClick={() => setSelectedStat(stat.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${
                    selectedStat === stat.value
                      ? 'bg-[var(--accent-primary)] text-black border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/20'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]/30'
                  }`}
                >
                  <span className={selectedStat === stat.value ? 'text-black' : stat.color}>
                    {stat.icon}
                  </span>
                  <span className="font-medium">{stat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Stat Info */}
          <div className="mb-8 p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={getCurrentStatInfo().color}>
                  {getCurrentStatInfo().icon}
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    {getCurrentStatInfo().label} Rankings
                  </h2>
                  <p className="text-[var(--text-muted)]">
                    Top players ranked by {getCurrentStatInfo().label.toLowerCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchLeaderboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[var(--text-muted)]">Loading leaderboard...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Leaderboard Table */}
          {!loading && !error && (
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              {leaderboard.length > 0 ? (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id || index}
                      className={`p-6 transition-all duration-300 ${getRankBg(entry.rank)} hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Rank */}
                          <div className="flex items-center justify-center min-w-[60px]">
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          {/* Player Info */}
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                              {entry.display_name || entry.username}
                              {isAuthenticated && user?.username === entry.username && (
                                <span className="ml-2 px-2 py-1 bg-[var(--accent-primary)] text-black text-xs rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </h3>
                            <p className="text-[var(--text-muted)]">@{entry.username}</p>
                            {entry.rank <= 3 && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1 w-1 rounded-full bg-[var(--accent-primary)]"></div>
                                <span className="text-xs text-[var(--accent-primary)] font-medium">
                                  {entry.rank === 1 ? 'Champion' : entry.rank === 2 ? 'Runner-up' : 'Third Place'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stat Value */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[var(--accent-primary)] font-mono mb-1">
                            {formatStatValue(entry.value, selectedStat)}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {getCurrentStatInfo().label}
                          </div>
                          {entry.rank <= 10 && (
                            <div className="text-xs text-[var(--accent-primary)] mt-1 font-medium">
                              Top {Math.ceil((entry.rank / leaderboard.length) * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Trophy className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
                    No Data Available
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    Leaderboard data is not available at the moment
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          {!loading && !error && leaderboard.length > 0 && (
            <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                <span>
                  Showing top {leaderboard.length} players
                </span>
                <span>
                  Last updated: {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LeaderboardPage;