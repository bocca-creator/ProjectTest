import React, { useState } from 'react';
import { Palette, Check, Monitor, Gamepad2, Briefcase, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = ({ className = '' }) => {
  const { currentTheme, themes, changeTheme, isTransitioning } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Gaming': return <Gamepad2 size={16} />;
      case 'Professional': return <Briefcase size={16} />;
      case 'Retro': return <Monitor size={16} />;
      default: return <Palette size={16} />;
    }
  };

  const getPreviewColors = (theme) => {
    return {
      primary: theme.variables['--bg-primary'],
      secondary: theme.variables['--bg-secondary'],
      accent: theme.variables['--accent-primary']
    };
  };

  const handleThemeSelect = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes[currentTheme];

  return (
    <div className={`theme-switcher ${className}`}>
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
      >
        <Palette size={18} />
        <span className="theme-current-name">{currentThemeData.name}</span>
        <div className="theme-preview-dots">
          {Object.entries(getPreviewColors(currentThemeData)).map(([key, color]) => (
            <div 
              key={key}
              className="preview-dot"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </button>

      {isOpen && (
        <>
          <div className="theme-overlay" onClick={() => setIsOpen(false)} />
          <div className="theme-dropdown">
            <div className="theme-dropdown-header">
              <h3>Choose Theme</h3>
              <p>Select your preferred visual style</p>
            </div>
            
            <div className="theme-categories">
              {Object.entries(
                Object.values(themes).reduce((acc, theme) => {
                  if (!acc[theme.category]) acc[theme.category] = [];
                  acc[theme.category].push(theme);
                  return acc;
                }, {})
              ).map(([category, categoryThemes]) => (
                <div key={category} className="theme-category">
                  <div className="category-header">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </div>
                  
                  <div className="theme-options">
                    {categoryThemes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                        onClick={() => handleThemeSelect(theme.id)}
                        disabled={isTransitioning}
                      >
                        <div className="theme-info">
                          <div className="theme-header">
                            <span className="theme-name">{theme.name}</span>
                            {currentTheme === theme.id && (
                              <Check size={16} className="check-icon" />
                            )}
                          </div>
                          <p className="theme-description">{theme.description}</p>
                        </div>
                        
                        <div className="theme-preview">
                          <div className="preview-container">
                            {Object.entries(getPreviewColors(theme)).map(([key, color]) => (
                              <div 
                                key={key}
                                className={`preview-section ${key}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            <div className="preview-accent-bar" style={{ 
                              backgroundColor: theme.variables['--accent-primary'] 
                            }} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="theme-dropdown-footer">
              <div className="theme-tip">
                <Zap size={14} />
                <span>Theme preference is saved automatically</span>
              </div>
            </div>
          </div>
        </>
      )}

      {isTransitioning && (
        <div className="theme-transition-overlay">
          <div className="transition-spinner">
            <Palette size={24} />
            <span>Applying Theme...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;