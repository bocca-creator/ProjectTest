import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import cs2Service from '../services/cs2Service';
import { Trophy, Target, Award, TrendingUp, Users, Medal, Crown, X } from 'lucide-react';

const CS2LeaderboardModal = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStat, setSelectedStat] = useState('kd_ratio');
  const [error, setError] = useState(null);

  const statTypes = [
    { value: 'kd_ratio', label: 'K/D Ratio', icon: <Target className="h-4 w-4" /> },
    { value: 'win_rate', label: 'Win Rate', icon: <Trophy className="h-4 w-4" /> },
    { value: 'total_kills', label: 'Total Kills', icon: <Award className="h-4 w-4" /> },
    { value: 'headshot_percentage', label: 'Headshot %', icon: <Target className="h-4 w-4" /> },
    { value: 'matches_played', label: 'Matches Played', icon: <Users className="h-4 w-4" /> },
    { value: 'mvp_count', label: 'MVP Count', icon: <Crown className="h-4 w-4" /> },
    { value: 'adr', label: 'ADR', icon: <TrendingUp className="h-4 w-4" /> }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, selectedStat]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cs2Service.getLeaderboard(selectedStat, 50);
      if (result.success) {
        setLeaderboard(result.data.leaderboard || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-300" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-[var(--text-muted)]">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2: return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default: return 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)]';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[var(--bg-secondary)] border-[var(--border-primary)] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-[var(--text-primary)] flex items-center gap-3">
            <div className="h-8 w-8 bg-[var(--accent-bg)] rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-[var(--accent-primary)]" />
            </div>
            CS2 Leaderboard
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {/* Stat Type Selector */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {statTypes.map((stat) => (
              <Button
                key={stat.value}
                onClick={() => setSelectedStat(stat.value)}
                variant={selectedStat === stat.value ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-2 ${
                  selectedStat === stat.value
                    ? 'bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-hover)]'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {stat.icon}
                {stat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Stat Info */}
        <div className="mb-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
          <div className="flex items-center gap-3">
            {getCurrentStatInfo().icon}
            <div>
              <h3 className="font-medium text-[var(--text-primary)]">
                {getCurrentStatInfo().label} Leaderboard
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Top players ranked by {getCurrentStatInfo().label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[var(--text-muted)]">Loading leaderboard...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
            <p className="text-[var(--error)] text-sm">{error}</p>
          </div>
        )}

        {/* Leaderboard List */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id || index}
                    className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getRankBg(entry.rank)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        {/* Player Info */}
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">
                            {entry.display_name || entry.username}
                          </h4>
                          <p className="text-sm text-[var(--text-muted)]">
                            @{entry.username}
                          </p>
                        </div>
                      </div>

                      {/* Stat Value */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--accent-primary)] font-mono">
                          {formatStatValue(entry.value, selectedStat)}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {getCurrentStatInfo().label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--text-muted)]">No leaderboard data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            {leaderboard.length > 0 && (
              `Showing top ${leaderboard.length} players`
            )}
          </p>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CS2LeaderboardModal;