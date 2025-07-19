import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState(defaultMode); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'register' && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'register' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.displayName || null,
          'en' // Default language, could be made dynamic
        );
      }

      if (result.success) {
        onClose();
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          displayName: '',
        });
        setErrors({});
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      displayName: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
            {mode === 'login' ? (
              <>
                <LogIn className="h-5 w-5 text-[var(--accent-primary)]" />
                {t('auth.login', 'Sign In')}
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-[var(--accent-primary)]" />
                {t('auth.register', 'Create Account')}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 rounded-md bg-[var(--error)]/10 border border-[var(--error)]/20">
              <p className="text-[var(--error)] text-sm">{errors.general}</p>
            </div>
          )}

          {/* Username (Register only) */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-sm font-medium">
                {t('auth.username', 'Username')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  placeholder={t('auth.usernamePlaceholder', 'Enter your username')}
                />
              </div>
              {errors.username && (
                <p className="text-[var(--error)] text-sm">{errors.username}</p>
              )}
            </div>
          )}

          {/* Display Name (Register only, optional) */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[var(--text-secondary)] text-sm font-medium">
                {t('auth.displayName', 'Display Name')} <span className="text-[var(--text-muted)]">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                  placeholder={t('auth.displayNamePlaceholder', 'Your display name')}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-medium">
              {t('auth.email', 'Email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                placeholder={t('auth.emailPlaceholder', 'Enter your email')}
              />
            </div>
            {errors.email && (
              <p className="text-[var(--error)] text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[var(--text-secondary)] text-sm font-medium">
              {t('auth.password', 'Password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="pl-10 pr-10 bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[var(--error)] text-sm">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                {mode === 'login' ? t('auth.signingIn', 'Signing in...') : t('auth.creatingAccount', 'Creating account...')}
              </div>
            ) : (
              <>
                {mode === 'login' ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    {t('auth.signIn', 'Sign In')}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {t('auth.createAccount', 'Create Account')}
                  </>
                )}
              </>
            )}
          </Button>
        </form>

        {/* Mode Switch */}
        <div className="text-center pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-[var(--text-muted)] text-sm">
            {mode === 'login' ? (
              <>
                {t('auth.noAccount', "Don't have an account?")}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="ml-2 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium"
                >
                  {t('auth.signUp', 'Sign up')}
                </button>
              </>
            ) : (
              <>
                {t('auth.haveAccount', 'Already have an account?')}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="ml-2 text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium"
                >
                  {t('auth.signIn', 'Sign in')}
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;