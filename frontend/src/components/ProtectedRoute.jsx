import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthModal from './AuthModal';

const ProtectedRoute = ({ children, fallback = null, showModal = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-muted)]">{t('auth.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, show fallback or auth prompt
  if (fallback) {
    return fallback;
  }

  // Default fallback: show authentication prompt
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-[var(--accent-bg)] flex items-center justify-center">
            <svg
              className="h-8 w-8 text-[var(--accent-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {t('auth.required', 'Authentication Required')}
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            {t('auth.requiredMessage', 'Please sign in to access this feature.')}
          </p>
          {showModal && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black px-6 py-2 rounded-md font-medium transition-colors"
            >
              {t('auth.signIn', 'Sign In')}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="login"
        />
      )}
    </>
  );
};

export default ProtectedRoute;