import React, { useState } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { Users, Crown, Shield, Settings, MessageSquare, Award, ExternalLink, Mail } from 'lucide-react';

const TeamPage = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const teamMembers = [
    {
      id: 1,
      name: 'CyberKing',
      role: 'Founder & CEO',
      title: 'Community Leader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CyberKing',
      description: 'Visionary behind ProjectTest. 10+ years in competitive gaming and community building.',
      specialties: ['Community Leadership', 'Strategic Planning', 'Player Relations'],
      status: 'online',
      joinDate: 'January 2023',
      achievements: ['Community Founder', 'Tournament Organizer', '10K+ Hours Gaming'],
      contact: { discord: 'CyberKing#0001', email: 'admin@projecttest.com' }
    },
    {
      id: 2,
      name: 'NeonGuardian',
      role: 'Head Administrator',
      title: 'Server Management',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NeonGuardian',
      description: 'Ensures server stability and community safety. Expert in anti-cheat systems and moderation.',
      specialties: ['Server Administration', 'Anti-Cheat Systems', 'Community Moderation'],
      status: 'online',
      joinDate: 'March 2023',
      achievements: ['Zero Downtime Record', 'Anti-Cheat Expert', 'Community Safety Leader'],
      contact: { discord: 'NeonGuardian#0002' }
    },
    {
      id: 3,
      name: 'PixelWarden',
      role: 'Community Manager',
      title: 'Player Experience',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PixelWarden',
      description: 'Manages community events, tournaments, and player relations. Your go-to person for all things community.',
      specialties: ['Event Organization', 'Tournament Management', 'Player Support'],
      status: 'online',
      joinDate: 'April 2023',
      achievements: ['50+ Events Organized', 'Tournament Champion', 'Community Favorite'],
      contact: { discord: 'PixelWarden#0003' }
    },
    {
      id: 4,
      name: 'DataGhost',
      role: 'Technical Director',
      title: 'Platform Development',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataGhost',
      description: 'Leads technical development of our platform. Ensures cutting-edge features and optimal performance.',
      specialties: ['Full-Stack Development', 'Database Management', 'API Integration'],
      status: 'offline',
      joinDate: 'February 2023',
      achievements: ['Platform Architect', 'Performance Optimizer', 'Feature Innovator'],
      contact: { discord: 'DataGhost#0004' }
    },
    {
      id: 5,
      name: 'VoidModerator',
      role: 'Senior Moderator',
      title: 'Community Safety',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoidModerator',
      description: 'Maintains community standards and helps new members. Available 24/7 for support and assistance.',
      specialties: ['Community Guidelines', 'Conflict Resolution', 'New Member Support'],
      status: 'away',
      joinDate: 'May 2023',
      achievements: ['Trusted Moderator', 'Conflict Resolver', '1000+ Players Helped'],
      contact: { discord: 'VoidModerator#0005' }
    },
    {
      id: 6,
      name: 'ElectricStorm',
      role: 'Event Coordinator',
      title: 'Tournament Operations',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElectricStorm',
      description: 'Organizes tournaments and competitive events. Expert in brackets, scheduling, and prize distribution.',
      specialties: ['Tournament Organization', 'Prize Management', 'Competitive Balance'],
      status: 'online',
      joinDate: 'June 2023',
      achievements: ['Tournament Master', 'Fair Play Advocate', 'Prize Pool Manager'],
      contact: { discord: 'ElectricStorm#0006' }
    }
  ];

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'founder & ceo': return <Crown size={18} />;
      case 'head administrator': return <Shield size={18} />;
      case 'community manager': return <Users size={18} />;
      case 'technical director': return <Settings size={18} />;
      case 'senior moderator': return <Shield size={18} />;
      case 'event coordinator': return <Award size={18} />;
      default: return <Users size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'var(--success)';
      case 'away': return 'var(--warning)';
      case 'offline': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusDot = (status) => {
    return {
      backgroundColor: getStatusColor(status),
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '6px'
    };
  };

  const departments = [
    {
      name: 'Leadership',
      description: 'Strategic direction and community vision',
      memberCount: 1,
      color: 'var(--accent-primary)'
    },
    {
      name: 'Administration',
      description: 'Server management and technical operations',
      memberCount: 2,
      color: 'var(--accent-blue)'
    },
    {
      name: 'Community',
      description: 'Player relations and community engagement',
      memberCount: 2,
      color: 'var(--accent-purple)'
    },
    {
      name: 'Events',
      description: 'Tournament organization and competitions',
      memberCount: 1,
      color: 'var(--warning)'
    }
  ];

  return (
    <div className="team-page">
      <Navigation user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="page-hero">
        <div className="hero-background">
          <div className="cyber-grid"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <Users size={48} className="hero-icon" />
            <h1 className="hero-title">Meet Our Team</h1>
            <p className="hero-description">
              The passionate individuals who make ProjectTest possible. Our team of dedicated gamers, 
              developers, and community builders work 24/7 to ensure the best experience for our members.
            </p>
          </div>
        </div>
      </section>

      {/* Page Content - Sequential and Centered */}
      <main className="page-content">
        <div className="content-container">
          
          {/* Team Overview */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>Department Overview</h2>
            </div>
            <div className="overview-grid">
              {departments.map((dept, index) => (
                <div key={index} className="department-card">
                  <div className="dept-header">
                    <h3 style={{ color: dept.color }}>{dept.name}</h3>
                    <span className="member-count">{dept.memberCount} member{dept.memberCount !== 1 ? 's' : ''}</span>
                  </div>
                  <p>{dept.description}</p>
                  <div className="dept-bar" style={{ backgroundColor: `${dept.color}20`, borderLeft: `3px solid ${dept.color}` }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="sequential-section">
            <div className="section-header">
              <h2>Core Team Members</h2>
            </div>
            <div className="members-grid">
              {teamMembers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-header">
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                    <div className="member-status">
                      <div style={getStatusDot(member.status)}></div>
                      <span>{member.status}</span>
                    </div>
                  </div>

                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <div className="member-role">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                    <div className="member-title">{member.title}</div>
                    
                    <p className="member-description">{member.description}</p>

                    <div className="member-specialties">
                      <h4>Specialties</h4>
                      <div className="specialties-tags">
                        {member.specialties.map((specialty, index) => (
                          <span key={index} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>

                    <div className="member-achievements">
                      <h4>Achievements</h4>
                      <ul>
                        {member.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="member-meta">
                      <div className="join-date">
                        <span>Joined: {member.joinDate}</span>
                      </div>
                    </div>

                    <div className="member-contact">
                      <h4>Contact</h4>
                      <div className="contact-methods">
                        {member.contact.discord && (
                          <div className="contact-item">
                            <MessageSquare size={16} />
                            <span>{member.contact.discord}</span>
                          </div>
                        )}
                        {member.contact.email && (
                          <div className="contact-item">
                            <Mail size={16} />
                            <span>{member.contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Join Team CTA */}
          <div className="sequential-section">
            <div className="join-team-card">
              <h2>Want to Join Our Team?</h2>
              <p>
                We're always looking for passionate individuals who share our vision of building 
                the best gaming community. Whether you're interested in moderation, event organization, 
                development, or community management, we'd love to hear from you.
              </p>
              <div className="requirements">
                <h3>What We Look For:</h3>
                <ul>
                  <li>Passion for gaming and community building</li>
                  <li>Experience in relevant areas (moderation, development, events)</li>
                  <li>Commitment to fair play and community values</li>
                  <li>Active participation in ProjectTest community</li>
                  <li>Ability to work collaboratively in a team environment</li>
                </ul>
              </div>
              <div className="join-actions">
                <button className="btn-primary" onClick={() => window.location.href = '/contact'}>
                  <Mail size={18} />
                  Apply Now
                </button>
                <button className="btn-secondary" onClick={() => window.location.href = '/'}>
                  <Users size={18} />
                  Join Community First
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamPage;