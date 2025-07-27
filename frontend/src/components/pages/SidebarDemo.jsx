import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ExpandedSidebar from '../ExpandedSidebar';
import Navigation from '../Navigation';
import ProtectedRoute from '../ProtectedRoute';

const SidebarDemo = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--bg-primary)] flex">
        {/* Expanded Sidebar */}
        <ExpandedSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 ml-[280px]">
          <Navigation />
          
          <main className="p-8 pt-24">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                  Expanded Sidebar Demo
                </h1>
                <p className="text-lg text-[var(--text-muted)] mb-8">
                  This demonstrates the expanded sidebar interface with proper proportions and spacing
                </p>
                
                {user && (
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)] mb-8">
                    <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
                      Welcome, {user.display_name || user.username}!
                    </h2>
                    <p className="text-[var(--text-secondary)]">
                      The sidebar on the left shows your profile information, CS2 statistics, 
                      and navigation options with improved spacing and proportions.
                    </p>
                  </div>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    Enhanced Profile Section
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    The user profile section now has better spacing around the avatar, name, 
                    and role information. The dropdown reveals additional details like email 
                    and badges.
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    CS2 Statistics Display
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    The CS2 rank is displayed in a proper circular indicator with better 
                    proportions. K/D ratio and win rate are clearly separated with adequate spacing.
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    Navigation Links
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    All navigation links have proper horizontal padding and spacing. 
                    The Admin Panel link is highlighted in red for easy identification.
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-subtle)]">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    Footer Section
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    The bottom section includes a sign-out button and user statistics 
                    (login count and last login) with proper alignment and spacing.
                  </p>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-8 border border-[var(--border-subtle)]">
                <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
                  Sidebar Specifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-[var(--accent-primary)] mb-3">
                      Dimensions & Layout
                    </h4>
                    <ul className="text-[var(--text-muted)] space-y-2">
                      <li>• Width: 280px (instead of compact 150px)</li>
                      <li>• Fixed position on the left side</li>
                      <li>• Full height with proper sections</li>
                      <li>• Responsive design for mobile devices</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-[var(--accent-primary)] mb-3">
                      Visual Improvements
                    </h4>
                    <ul className="text-[var(--text-muted)] space-y-2">
                      <li>• Better padding and margins throughout</li>
                      <li>• Proper proportions for all elements</li>
                      <li>• Consistent spacing between sections</li>
                      <li>• Enhanced hover effects and transitions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SidebarDemo;