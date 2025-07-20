import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  Crown, Star, Zap, Gift, Shield, Sparkles,
  Check, ExternalLink, Heart, DollarSign,
  Users, Trophy, Settings, Award,
  AlertCircle, RefreshCw, Calendar
} from 'lucide-react';

const RanksPage = () => {
  const { user } = useAuth();
  const [tiers, setTiers] = useState([]);
  const [myTier, setMyTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchTiers();
    if (user) {
      fetchMyTier();
    }
  }, [user]);

  const fetchTiers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tiers/benefits`);
      setTiers(response.data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setError('Failed to load tier information');
    }
  };

  const fetchMyTier = async () => {
    try {
      if (!user) return;
      
      const response = await axios.get(`${API_URL}/api/tiers/my-tier`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setMyTier(response.data);
    } catch (error) {
      console.error('Error fetching my tier:', error);
    }
  };

  const completeFetch = async () => {
    setLoading(false);
  };

  // Complete loading after both requests
  useEffect(() => {
    if (tiers.length > 0) {
      completeFetch();
    }
  }, [tiers]);

  const handlePurchase = async (tierName) => {
    try {
      if (!user) {
        alert('Please log in to purchase a tier');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/tiers/purchase/${tierName.toLowerCase()}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      // Show purchase info modal or redirect to payment
      alert(`Purchase initiated for ${response.data.name}!\n\nPrice: $${response.data.price}\n\nNote: ${response.data.note}\n\nContact admin for tier assignment.`);

    } catch (error) {
      console.error('Error initiating purchase:', error);
      alert('Failed to initiate purchase. Please try again or contact support.');
    }
  };

  const getTierIcon = (tierName) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return <Award className="w-8 h-8" style={{ color: '#CD7F32' }} />;
      case 'silver': return <Shield className="w-8 h-8" style={{ color: '#C0C0C0' }} />;
      case 'gold': return <Crown className="w-8 h-8" style={{ color: '#FFD700' }} />;
      case 'platinum': return <Star className="w-8 h-8" style={{ color: '#E5E4E2' }} />;
      case 'diamond': return <Sparkles className="w-8 h-8" style={{ color: '#B9F2FF' }} />;
      case 'elite': return <Zap className="w-8 h-8" style={{ color: '#FF6B6B' }} />;
      default: return <Gift className="w-8 h-8" />;
    }
  };

  const getTierGradient = (tierName) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'from-orange-600/20 to-orange-800/20 border-orange-500/30';
      case 'silver': return 'from-slate-600/20 to-slate-800/20 border-slate-500/30';
      case 'gold': return 'from-yellow-600/20 to-yellow-800/20 border-yellow-500/30';
      case 'platinum': return 'from-purple-600/20 to-purple-800/20 border-purple-500/30';
      case 'diamond': return 'from-cyan-600/20 to-cyan-800/20 border-cyan-500/30';
      case 'elite': return 'from-red-600/20 to-red-800/20 border-red-500/30';
      default: return 'from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30';
    }
  };

  const getDurationText = (durationDays) => {
    if (!durationDays) return 'Lifetime';
    if (durationDays === 30) return '1 Month';
    if (durationDays === 90) return '3 Months';
    return `${durationDays} Days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Loading tier information...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Crown className="w-16 h-16 text-[var(--accent-primary)]" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Support Our Community
            </h1>
            
            <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto mb-8">
              Join our supporter ranks and unlock exclusive benefits, cosmetics, and features. 
              Your contribution helps us maintain and improve the CS2 statistics platform.
            </p>

            {/* Current Tier Status */}
            {user && myTier && myTier.tier && (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30">
                <Crown className="w-5 h-5 text-[var(--accent-primary)]" />
                <span className="font-bold">Current Tier: {myTier.tier.charAt(0).toUpperCase() + myTier.tier.slice(1)}</span>
                {myTier.expires_at && (
                  <span className="text-[var(--text-muted)]">
                    • Expires: {new Date(myTier.expires_at).toLocaleDateString()}
                  </span>
                )}
                {myTier.is_lifetime && (
                  <span className="px-2 py-1 rounded-md text-xs bg-green-500/20 text-green-400">
                    LIFETIME
                  </span>
                )}
              </div>
            )}

            {!user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
                <AlertCircle className="w-4 h-4" />
                <span>Log in to see your current tier and purchase new ones</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers
            .sort((a, b) => a.display_order - b.display_order)
            .map((tier) => (
            <div
              key={tier.tier}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getTierGradient(tier.name)} border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                tier.is_featured ? 'ring-2 ring-[var(--accent-primary)]/50' : ''
              }`}
            >
              {/* Featured Badge */}
              {tier.is_featured && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-primary)] text-black">
                  POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Tier Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getTierIcon(tier.name)}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-[var(--text-muted)] mb-4">{tier.description}</p>
                  
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-[var(--accent-primary)]">
                      ${tier.price}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {getDurationText(tier.duration_days)}
                    </span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-primary)]">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Cosmetics */}
                {tier.cosmetics && tier.cosmetics.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Cosmetics Included:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tier.cosmetics.map((cosmetic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-md text-xs bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                        >
                          {cosmetic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(tier.name)}
                  disabled={!user || (myTier?.tier === tier.tier.toLowerCase())}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: tier.color_scheme?.primary || 'var(--accent-primary)',
                    color: 'black'
                  }}
                >
                  {myTier?.tier === tier.tier.toLowerCase() ? (
                    <>
                      <Check className="w-5 h-5" />
                      Current Tier
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Support with {tier.name}
                    </>
                  )}
                </button>

                {/* Payment Methods */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Payment methods available:
                  </p>
                  <div className="flex justify-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>💳 Card</span>
                    <span>🏦 Bank</span>
                    <span>₿ Crypto</span>
                    <span>💰 PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  How do tier purchases work?
                </h3>
                <p className="text-[var(--text-muted)]">
                  After purchasing a tier, you'll receive all the listed benefits immediately. 
                  Tiers are manually assigned by administrators after payment confirmation.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  Can I upgrade my tier?
                </h3>
                <p className="text-[var(--text-muted)]">
                  Yes! You can upgrade to a higher tier at any time. Contact our administrators 
                  for upgrade pricing and to maintain your current benefits.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  What happens if my tier expires?
                </h3>
                <p className="text-[var(--text-muted)]">
                  When your tier expires, you'll lose access to tier-specific benefits but 
                  keep your cosmetics and badges. You can renew at any time.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  Are there refunds available?
                </h3>
                <p className="text-[var(--text-muted)]">
                  We offer refunds within 7 days of purchase if you haven't used any tier benefits. 
                  Contact support for refund requests.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  How do I contact support?
                </h3>
                <p className="text-[var(--text-muted)]">
                  You can contact our support team through the contact form or reach out to 
                  administrators directly through the platform.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2 text-[var(--accent-primary)]">
                  Can I gift tiers to other users?
                </h3>
                <p className="text-[var(--text-muted)]">
                  Yes! Contact our administrators to arrange tier gifts for other community members. 
                  Perfect for friends and teammates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/5 border border-[var(--accent-primary)]/20">
          <div className="text-center">
            <Users className="w-12 h-12 text-[var(--accent-primary)] mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Support Our Community</h3>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto mb-6">
              Your support helps us maintain servers, develop new features, and create the best 
              CS2 statistics platform for the community. Every contribution makes a difference!
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="font-bold">1,500+</div>
                <div className="text-sm text-[var(--text-muted)]">Matches Tracked</div>
              </div>
              <div>
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="font-bold">250+</div>
                <div className="text-sm text-[var(--text-muted)]">Active Players</div>
              </div>
              <div>
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="font-bold">24/7</div>
                <div className="text-sm text-[var(--text-muted)]">Community Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RanksPage;