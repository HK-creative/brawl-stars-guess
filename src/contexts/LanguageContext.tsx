
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initLanguage, setLanguage, getLanguage } from '@/lib/i18n';

type SupportedLanguages = 'en' | 'he';

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
  const [language, setLang] = useState<SupportedLanguages>('en');

  useEffect(() => {
    initLanguage();
    setLang(getLanguage());
  }, []);

  const changeLanguage = (lang: SupportedLanguages) => {
    setLanguage(lang);
    setLang(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
