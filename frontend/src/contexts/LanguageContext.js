import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  uk: {
    code: 'uk', 
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('projecttest-language');
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED_LANGUAGES[browserLang]) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  // Update document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode] && languageCode !== currentLanguage) {
      setIsLoading(true);
      setCurrentLanguage(languageCode);
      localStorage.setItem('projecttest-language', languageCode);
      
      // Simulate loading for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const translate = (key, params = {}) => {
    try {
      // Split the key by dots to navigate nested objects
      const keys = key.split('.');
      let value = translations[currentLanguage];
      
      for (const k of keys) {
        value = value[k];
        if (value === undefined) break;
      }
      
      // If translation not found, try fallback to English
      if (value === undefined) {
        value = translations.en;
        for (const k of keys) {
          value = value[k];
          if (value === undefined) break;
        }
      }
      
      // If still not found, return the key itself
      if (value === undefined) {
        return key;
      }
      
      // Replace parameters in the translation if any
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
          return params[paramKey] || match;
        });
      }
      
      return value;
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return key;
    }
  };

  // Short alias for translate function
  const t = translate;

  const getCurrentLanguageInfo = () => {
    return SUPPORTED_LANGUAGES[currentLanguage];
  };

  const getAvailableLanguages = () => {
    return Object.values(SUPPORTED_LANGUAGES);
  };

  const isRTL = () => {
    // Add RTL language support if needed
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(currentLanguage);
  };

  const formatDate = (date, options = {}) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      }).format(dateObj);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return date;
    }
  };

  const formatNumber = (number, options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    } catch (error) {
      console.warn('Number formatting error:', error);
      return number;
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    t, // Short alias
    getCurrentLanguageInfo,
    getAvailableLanguages,
    isRTL,
    formatDate,
    formatNumber,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};