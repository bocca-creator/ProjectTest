import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Globe, Check } from 'lucide-react';

const LanguageSwitcher = ({ className = "" }) => {
  const { 
    currentLanguage, 
    changeLanguage, 
    getAvailableLanguages,
    getCurrentLanguageInfo,
    isLoading 
  } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = getAvailableLanguages();
  const currentLangInfo = getCurrentLanguageInfo();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative language-switcher ${className}`}>
      {/* Current Language Button */}
      <button
        onClick={toggleDropdown}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[var(--bg-secondary)] border border-[var(--border-primary)]
          text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]
          transition-all duration-200 min-w-[120px]
          ${isOpen ? 'ring-2 ring-[var(--accent-primary)] ring-opacity-30' : ''}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={isLoading}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLangInfo.flag} {currentLangInfo.nativeName}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2 
          bg-[var(--bg-secondary)] border border-[var(--border-primary)]
          rounded-lg shadow-lg shadow-black/20 
          min-w-[160px] z-50
        ">
          <div className="py-2">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center justify-between px-4 py-2
                  text-left text-sm transition-colors duration-150
                  hover:bg-[var(--bg-tertiary)]
                  ${currentLanguage === language.code 
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-bg)]' 
                    : 'text-[var(--text-primary)]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {language.name}
                    </div>
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;