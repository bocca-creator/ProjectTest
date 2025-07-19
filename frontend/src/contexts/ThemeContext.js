import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  darkNeon: {
    id: 'darkNeon',
    name: 'Dark Neon',
    description: 'Cyberpunk gaming aesthetic with neon green accents',
    category: 'Gaming',
    variables: {
      // Dark Theme Foundation
      '--bg-primary': 'rgb(17, 17, 19)',
      '--bg-secondary': 'rgb(26, 28, 30)',
      '--bg-tertiary': 'rgb(38, 40, 42)',
      
      // Text Colors
      '--text-primary': 'rgb(255, 255, 255)',
      '--text-secondary': 'rgb(218, 218, 218)',
      '--text-muted': 'rgb(161, 161, 170)',
      
      // Border Colors
      '--border-primary': 'rgb(63, 63, 63)',
      '--border-subtle': 'rgba(255, 255, 255, 0.1)',
      
      // Signature Neon Green
      '--accent-primary': 'rgb(218, 255, 1)',
      '--accent-hover': 'rgb(166, 190, 21)',
      '--accent-pressed': 'rgb(134, 155, 16)',
      '--accent-bg': 'rgba(218, 255, 1, 0.1)',
      
      // Secondary Accents
      '--accent-purple': 'rgb(147, 51, 234)',
      '--accent-blue': 'rgb(59, 130, 246)',
      '--accent-cyan': 'rgb(6, 182, 212)',
      
      // Status Colors
      '--success': 'rgb(34, 197, 94)',
      '--warning': 'rgb(251, 191, 36)',
      '--error': 'rgb(239, 68, 68)',
      
      // Special Effects
      '--glow-primary': '0 0 20px rgba(218, 255, 1, 0.3)',
      '--glow-secondary': '0 0 15px rgba(218, 255, 1, 0.2)'
    }
  },
  
  retroPixel: {
    id: 'retroPixel',
    name: 'Retro Pixel',
    description: '8-bit inspired gaming theme with classic arcade colors',
    category: 'Retro',
    variables: {
      // Retro Dark Foundation
      '--bg-primary': 'rgb(20, 20, 40)',
      '--bg-secondary': 'rgb(40, 40, 80)',
      '--bg-tertiary': 'rgb(60, 60, 120)',
      
      // Text Colors
      '--text-primary': 'rgb(255, 255, 255)',
      '--text-secondary': 'rgb(200, 200, 255)',
      '--text-muted': 'rgb(150, 150, 200)',
      
      // Border Colors
      '--border-primary': 'rgb(100, 100, 150)',
      '--border-subtle': 'rgba(255, 255, 255, 0.15)',
      
      // Retro Orange/Pink Accent
      '--accent-primary': 'rgb(255, 100, 150)',
      '--accent-hover': 'rgb(255, 120, 170)',
      '--accent-pressed': 'rgb(200, 80, 120)',
      '--accent-bg': 'rgba(255, 100, 150, 0.1)',
      
      // Secondary Accents
      '--accent-purple': 'rgb(180, 100, 255)',
      '--accent-blue': 'rgb(100, 150, 255)',
      '--accent-cyan': 'rgb(100, 255, 200)',
      
      // Status Colors
      '--success': 'rgb(100, 255, 100)',
      '--warning': 'rgb(255, 200, 100)',
      '--error': 'rgb(255, 100, 100)',
      
      // Special Effects
      '--glow-primary': '0 0 20px rgba(255, 100, 150, 0.4)',
      '--glow-secondary': '0 0 15px rgba(255, 100, 150, 0.3)'
    }
  },
  
  minimalistLight: {
    id: 'minimalistLight',
    name: 'Minimalist Light',
    description: 'Clean and professional light theme for daytime gaming',
    category: 'Professional',
    variables: {
      // Light Foundation
      '--bg-primary': 'rgb(255, 255, 255)',
      '--bg-secondary': 'rgb(248, 250, 252)',
      '--bg-tertiary': 'rgb(241, 245, 249)',
      
      // Text Colors
      '--text-primary': 'rgb(15, 23, 42)',
      '--text-secondary': 'rgb(51, 65, 85)',
      '--text-muted': 'rgb(100, 116, 139)',
      
      // Border Colors
      '--border-primary': 'rgb(203, 213, 225)',
      '--border-subtle': 'rgba(15, 23, 42, 0.1)',
      
      // Professional Blue Accent
      '--accent-primary': 'rgb(59, 130, 246)',
      '--accent-hover': 'rgb(37, 99, 235)',
      '--accent-pressed': 'rgb(29, 78, 216)',
      '--accent-bg': 'rgba(59, 130, 246, 0.1)',
      
      // Secondary Accents
      '--accent-purple': 'rgb(147, 51, 234)',
      '--accent-blue': 'rgb(14, 165, 233)',
      '--accent-cyan': 'rgb(6, 182, 212)',
      
      // Status Colors
      '--success': 'rgb(34, 197, 94)',
      '--warning': 'rgb(245, 158, 11)',
      '--error': 'rgb(239, 68, 68)',
      
      // Special Effects
      '--glow-primary': '0 0 20px rgba(59, 130, 246, 0.2)',
      '--glow-secondary': '0 0 15px rgba(59, 130, 246, 0.15)'
    }
  },
  
  cyberRed: {
    id: 'cyberRed',
    name: 'Cyber Red',
    description: 'Aggressive cyberpunk theme with red matrix aesthetics',
    category: 'Gaming',
    variables: {
      // Dark Red Foundation
      '--bg-primary': 'rgb(20, 10, 10)',
      '--bg-secondary': 'rgb(35, 15, 15)',
      '--bg-tertiary': 'rgb(50, 20, 20)',
      
      // Text Colors
      '--text-primary': 'rgb(255, 255, 255)',
      '--text-secondary': 'rgb(255, 200, 200)',
      '--text-muted': 'rgb(200, 150, 150)',
      
      // Border Colors
      '--border-primary': 'rgb(100, 50, 50)',
      '--border-subtle': 'rgba(255, 100, 100, 0.1)',
      
      // Cyber Red Accent
      '--accent-primary': 'rgb(255, 50, 100)',
      '--accent-hover': 'rgb(255, 70, 120)',
      '--accent-pressed': 'rgb(200, 30, 80)',
      '--accent-bg': 'rgba(255, 50, 100, 0.1)',
      
      // Secondary Accents
      '--accent-purple': 'rgb(200, 50, 255)',
      '--accent-blue': 'rgb(100, 150, 255)',
      '--accent-cyan': 'rgb(50, 255, 200)',
      
      // Status Colors
      '--success': 'rgb(100, 255, 150)',
      '--warning': 'rgb(255, 150, 50)',
      '--error': 'rgb(255, 50, 50)',
      
      // Special Effects
      '--glow-primary': '0 0 20px rgba(255, 50, 100, 0.4)',
      '--glow-secondary': '0 0 15px rgba(255, 50, 100, 0.3)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('darkNeon');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('projecttest-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[currentTheme];
    
    if (theme) {
      // Add transition class
      root.classList.add('theme-transition');
      
      // Apply theme variables
      Object.entries(theme.variables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
      
      // Add theme class to body
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${currentTheme}`);
      
      // Remove transition class after animation
      setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
    }
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (themes[themeId] && themeId !== currentTheme) {
      setIsTransitioning(true);
      setCurrentTheme(themeId);
      localStorage.setItem('projecttest-theme', themeId);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const value = {
    currentTheme,
    themes,
    changeTheme,
    isTransitioning,
    getCurrentThemeData: () => themes[currentTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};