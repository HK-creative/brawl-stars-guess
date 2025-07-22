import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguages, setLanguage, getLanguage, initLanguage } from '@/lib/i18n';

interface LanguageContextType {
  language: SupportedLanguages;
  changeLanguage: (lang: SupportedLanguages) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  changeLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<SupportedLanguages>(getLanguage());

  useEffect(() => {
    initLanguage();
    setLang(getLanguage());
  }, []);

  const changeLanguage = (lang: SupportedLanguages) => {
    // Immediately set the language in the i18n system
    setLanguage(lang);
    // Update the React state to trigger re-renders
    setLang(lang);
    
    // Force immediate DOM update for RTL/LTR direction
    requestAnimationFrame(() => {
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      
      // Refresh the page to ensure all changes are applied
      window.location.reload();
    });
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
