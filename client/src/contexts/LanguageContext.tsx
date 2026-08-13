import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations } from '@/i18n/translations';

export { translations };

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'epiminded_language';
const DEFAULT_LANGUAGE: Language = 'en';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Always starts at the default so the prerendered HTML and the first client
  // render agree. Reading localStorage here instead would (a) crash the
  // build-time render, where there is no localStorage, and (b) produce a
  // hydration mismatch for anyone whose stored language is 'fr'. The stored
  // preference is applied in the effect below, one paint later.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') setLanguageState(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  };

  const t = (key: string) => {
    return translations[language][key as keyof (typeof translations)['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
