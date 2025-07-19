import React from 'react';
import { Calendar, Pin, MessageSquare, Users, Star, ThumbsUp, Instagram, Send, Music } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeEditor from './ThemeEditor';

const MainContent = ({ announcements, reviews, discordData }) => {
  const { t, formatDate } = useLanguage();
  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'maintenance': return '🔧';
      case 'tournament': return '🏆';
      case 'update': return '🚀';
      case 'event': return '🎉';
      case 'security': return '🛡️';
      default: return '📢';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const getSocialIcon = (iconName) => {
    switch (iconName) {
      case 'instagram': return <Instagram size={20} />;
      case 'send': return <Send size={20} />;
      case 'music': return <Music size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Left Column - Announcements */}
        <div className="left-column">
          <div className="section-header">
            <h2>Project Updates & Announcements</h2>
            <div className="header-line"></div>
          </div>
          
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className={`announcement-card ${announcement.pinned ? 'pinned' : ''}`}
              >
                <div className="card-header">
                  <div className="announcement-meta">
                    <span className="announcement-icon">
                      {getAnnouncementIcon(announcement.type)}
                    </span>
                    <div className="meta-info">
                      <h3 className="announcement-title">
                        {announcement.pinned && <Pin size={16} className="pin-icon" />}
                        {announcement.title}
                      </h3>
                      <div className="meta-details">
                        <span className="author">{announcement.author}</span>
                        <span className="separator">•</span>
                        <span className="timestamp">{formatTimestamp(announcement.timestamp)}</span>
                        <span className="type-badge type-{announcement.type}">{announcement.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  <p className="announcement-content">{announcement.content}</p>
                  <div className="card-actions">
                    <button className="btn-ghost small">Read More</button>
                    <button className="btn-ghost small">
                      <MessageSquare size={14} />
                      Comments
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Discord, Reviews, Social */}
        <div className="right-column">
          {/* Discord Widget */}
          <div className="discord-widget">
            <div className="widget-header">
              <div className="discord-logo">
                <div className="discord-icon"></div>
                <span>Discord Server</span>
              </div>
              <div className="online-indicator">
                <div className="online-dot"></div>
                <span>{discordData.onlineMembers} online</span>
              </div>
            </div>
            
            <div className="discord-info">
              <h3>{discordData.serverName}</h3>
              <p>{discordData.totalMembers.toLocaleString()} members</p>
            </div>

            <div className="discord-channels">
              <h4>Active Channels</h4>
              {discordData.channels.slice(0, 3).map((channel, index) => (
                <div key={index} className={`channel-item ${channel.active ? 'active' : ''}`}>
                  <span className="channel-name"># {channel.name}</span>
                  <span className="channel-count">{channel.memberCount}</span>
                </div>
              ))}
            </div>

            <div className="discord-activity">
              <h4>Recent Activity</h4>
              {discordData.recentMessages.slice(0, 2).map((message, index) => (
                <div key={index} className="activity-item">
                  <span className="username">{message.username}</span>
                  <span className="message">{message.message}</span>
                  <span className="time">{message.timestamp}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary discord-join">
              Join Discord Server
            </button>
          </div>

          {/* User Reviews Section */}
          <div className="reviews-section">
            <div className="section-header">
              <h3>Community Reviews</h3>
              <div className="review-stats">
                <div className="avg-rating">
                  <span className="rating-number">4.8</span>
                  <div className="rating-stars">
                    {renderStars(5)}
                  </div>
                </div>
              </div>
            </div>

            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <img src={review.avatar} alt={review.username} className="review-avatar" />
                    <div className="review-meta">
                      <span className="review-username">{review.username}</span>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                      </div>
                      <span className="review-date">{formatTimestamp(review.timestamp)}</span>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <div className="review-actions">
                    <button className="like-btn">
                      <ThumbsUp size={14} />
                      {review.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-secondary">Write a Review</button>
          </div>

          {/* Social Media Bar */}
          <div className="social-media-bar">
            <h3>Follow Us</h3>
            <div className="social-links">
              {mockData.socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="social-icon">
                    {getSocialIcon(social.icon)}
                  </div>
                  <div className="social-info">
                    <span className="social-name">{social.name}</span>
                    <span className="social-followers">{social.followers} followers</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Import mockData for the social media section
import { mockData } from '../data/mock';

export default MainContent;