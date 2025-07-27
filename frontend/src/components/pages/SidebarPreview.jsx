import React from 'react';
import ExpandedSidebar from '../ExpandedSidebar';

const SidebarPreview = () => {
  // Mock user data for demo purposes
  const mockUser = {
    id: '1',
    username: 'admin',
    display_name: 'Admin',
    email: 'admin@admin.com',
    role: 'admin',
    avatar_url: null,
    steam_id: 'STEAM_123456',
    login_count: 47,
    last_login: '2025-01-27T10:00:00Z'
  };

  // Mock CS2 stats for demo
  const mockStats = {
    success: true,
    data: {
      username: 'admin',
      stats: {
        current_rank: 'Silver II',
        kd_ratio: '1.23',
        win_rate: 46,
        total_kills: 2847,
        total_deaths: 2314,
        matches_played: 156,
        headshot_percentage: 67,
        mvp_count: 23
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Demo Expanded Sidebar - using inline styles to show preview */}
      <div style={{ width: '280px' }}>
        <div className="expanded-sidebar">
          {/* User Profile Section */}
          <div className="sidebar-profile">
            <div className="profile-header">
              <button className="profile-button">
                <div className="profile-avatar">
                  <span className="avatar-text">A</span>
                </div>
                <div className="profile-info">
                  <div className="profile-name">Admin</div>
                  <div className="profile-role">admin</div>
                </div>
                <svg className="profile-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="profile-details">
              <div className="profile-email">admin@admin.com</div>
              <div className="profile-badges">
                <span className="badge badge-role">admin</span>
                <span className="badge badge-steam">Steam Linked</span>
              </div>
            </div>
          </div>

          {/* CS2 Statistics Section */}
          <div className="cs2-stats-section">
            <div className="cs2-header">
              <svg className="cs2-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l7-7 3 3-7 7-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 11l3-3-3-3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m11 15l3-3-3-3" />
              </svg>
              <span className="cs2-title">CS2</span>
            </div>
            
            <div className="cs2-rank-display">
              <div 
                className="rank-circle"
                style={{ 
                  borderColor: '#6B7280',
                  backgroundColor: '#6B728015'
                }}
              >
                <div className="rank-text">Silver II</div>
              </div>
            </div>

            <div className="cs2-stats-grid">
              <div className="stat-item">
                <div className="stat-value">1.23</div>
                <div className="stat-label">K/D</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">46%</div>
                <div className="stat-label">WIN RATE</div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-navigation">
            <button className="nav-item">
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Player Dashboard</span>
            </button>
            
            <button className="nav-item">
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>CS2 Leaderboard</span>
            </button>
            
            <button className="nav-item">
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Quick Account</span>
            </button>

            <button className="nav-item admin">
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Footer Section */}
          <div className="sidebar-footer">
            <button className="logout-button">
              <svg className="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>

            <div className="user-stats">
              <div className="user-stat">
                <div className="stat-number">47</div>
                <div className="stat-text">LOGINS</div>
              </div>
              <div className="user-stat">
                <div className="stat-number">Never</div>
                <div className="stat-text">LAST LOGIN</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1" style={{ marginLeft: '0' }}>        
        <main className="p-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                Expanded Sidebar Preview
              </h1>
              <p className="text-lg text-[var(--text-muted)] mb-8">
                This demonstrates the expanded sidebar interface as described in your requirements
              </p>
              
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)] mb-8">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                  ✅ Розширений вигляд реалізовано
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Бічна панель тепер має ширину 280px (замість 150px) з правильними пропорціями 
                  та покращеним розподілом простору між всіма елементами.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  👤 Профіль користувача
                </h3>
                <p className="text-[var(--text-muted)]">
                  Аватар залишається пропорційним, ім'я та роль мають достатньо простору. 
                  Email та badges розташовані під іменем з належними відступами.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  🎯 CS2 Статистика
                </h3>
                <p className="text-[var(--text-muted)]">
                  Круговий індикатор "Silver II" зберігає форму з більшим горизонтальним простором. 
                  K/D та WIN RATE чітко розділені з правильними пропорціями.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  📱 Навігаційні посилання
                </h3>
                <p className="text-[var(--text-muted)]">
                  Кожне посилання на окремому рядку з іконкою та текстом. 
                  Збільшені горизонтальні відступи та покращене візуальне розділення.
                </p>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  🚪 Нижній блок
                </h3>
                <p className="text-[var(--text-muted)]">
                  Кнопка "Sign Out" з достатньою шириною. Статистика логінів 
                  акуратно вирівняна з правильними відступами.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarPreview;