import React from 'react';
import { MapPin, Users, Clock, Wifi, Gamepad2, Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CS2Servers = () => {
  const { t } = useLanguage();

  const servers = [
    {
      id: 1,
      name: "ProjectTest #1 - Competitive",
      gameMode: "Competitive 5v5",
      currentMap: "de_dust2",
      nextMap: "de_mirage", 
      players: 18,
      maxPlayers: 20,
      ping: 15,
      location: "EU West",
      status: "online",
      timeLeft: "12:34",
      mapRotation: ["de_dust2", "de_mirage", "de_inferno", "de_cache", "de_overpass"]
    },
    {
      id: 2,
      name: "ProjectTest #2 - Casual",
      gameMode: "Casual 10v10",
      currentMap: "de_mirage",
      nextMap: "de_inferno",
      players: 16,
      maxPlayers: 20,
      ping: 18,
      location: "EU Central",
      status: "online",
      timeLeft: "8:45",
      mapRotation: ["de_mirage", "de_inferno", "de_nuke", "de_train", "de_ancient"]
    },
    {
      id: 3,
      name: "ProjectTest #3 - Deathmatch",
      gameMode: "Deathmatch",
      currentMap: "de_dust2",
      nextMap: "aim_map",
      players: 12,
      maxPlayers: 16,
      ping: 22,
      location: "EU East",
      status: "online",
      timeLeft: "5:12",
      mapRotation: ["de_dust2", "aim_map", "de_mirage", "fy_iceworld"]
    },
    {
      id: 4,
      name: "ProjectTest #4 - Retakes",
      gameMode: "Retakes",
      currentMap: "de_inferno",
      nextMap: "de_cache",
      players: 8,
      maxPlayers: 10,
      ping: 12,
      location: "EU West",
      status: "online",
      timeLeft: "15:23",
      mapRotation: ["de_inferno", "de_cache", "de_overpass", "de_vertigo"]
    }
  ];

  const getServerStatusColor = (status) => {
    switch (status) {
      case 'online': return 'var(--success)';
      case 'offline': return 'var(--error)';
      case 'maintenance': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  const getGameModeIcon = (gameMode) => {
    if (gameMode.includes('Competitive')) return <Target size={16} />;
    if (gameMode.includes('Casual')) return <Users size={16} />;
    if (gameMode.includes('Deathmatch')) return <Gamepad2 size={16} />;
    return <Gamepad2 size={16} />;
  };

  const connectToServer = (server) => {
    // This would normally trigger a game connection
    console.log(`Connecting to ${server.name}...`);
    // Example: steam://connect/ip:port
  };

  return (
    <section className="cs2-servers-section">
      {/* Centered Header Section */}
      <div className="servers-header-container">
        <div className="section-header">
          <h2>CS2 Game Servers</h2>
          <p className="section-subtitle">Join our high-performance Counter-Strike 2 servers with optimal ping and 24/7 uptime</p>
          <div className="header-line"></div>
        </div>
      </div>

      {/* Centered Server Cards Section */}
      <div className="servers-cards-container">
        <div className="servers-grid">
          {servers.map((server) => (
            <div key={server.id} className="server-card">
              <div className="server-header">
                <div className="server-info">
                  <h3 className="server-name">{server.name}</h3>
                  <div className="server-mode">
                    {getGameModeIcon(server.gameMode)}
                    <span>{server.gameMode}</span>
                  </div>
                </div>
                <div 
                  className="server-status"
                  style={{ color: getServerStatusColor(server.status) }}
                >
                  <div className="status-dot" style={{ backgroundColor: getServerStatusColor(server.status) }}></div>
                  <span>{server.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="server-details">
                <div className="server-stats">
                  <div className="stat-item">
                    <Users size={14} />
                    <span className="stat-value">{server.players}/{server.maxPlayers}</span>
                    <span className="stat-label">{t('servers.playerCount')}</span>
                  </div>
                  <div className="stat-item">
                    <Wifi size={14} />
                    <span className="stat-value">{server.ping}ms</span>
                    <span className="stat-label">{t('servers.ping')}</span>
                  </div>
                  <div className="stat-item">
                    <MapPin size={14} />
                    <span className="stat-value">{server.location}</span>
                    <span className="stat-label">{t('servers.serverLocation')}</span>
                  </div>
                </div>

                <div className="map-info">
                  <div className="current-map">
                    <span className="map-label">{t('servers.currentMap')}:</span>
                    <span className="map-name">{server.currentMap}</span>
                  </div>
                  <div className="map-timer">
                    <Clock size={14} />
                    <span>{server.timeLeft}</span>
                  </div>
                </div>

                <div className="next-map">
                  <span className="next-label">{t('servers.nextMap')}:</span>
                  <span className="next-name">{server.nextMap}</span>
                </div>

                <div className="map-rotation">
                  <span className="rotation-label">{t('servers.mapRotation')}:</span>
                  <div className="rotation-maps">
                    {server.mapRotation.map((map, index) => (
                      <span 
                        key={index} 
                        className={`rotation-map ${map === server.currentMap ? 'current' : ''}`}
                      >
                        {map}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="server-actions">
                <button 
                  className={`connect-btn ${server.players >= server.maxPlayers ? 'disabled' : ''}`}
                  onClick={() => connectToServer(server)}
                  disabled={server.players >= server.maxPlayers}
                >
                  {server.players >= server.maxPlayers ? t('servers.serverFull') : t('servers.connect')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Centered Statistics Summary Section */}
      <div className="servers-stats-container">
        <div className="servers-summary">
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="summary-number">
                {servers.reduce((total, server) => total + server.players, 0)}
              </span>
              <span className="summary-label">PLAYERS ONLINE</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">{servers.length}</span>
              <span className="summary-label">ACTIVE SERVERS</span>
            </div>
            <div className="summary-stat">
              <span className="summary-number">
                {Math.round(servers.reduce((total, server) => total + server.ping, 0) / servers.length)}ms
              </span>
              <span className="summary-label">AVG PING</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CS2Servers;