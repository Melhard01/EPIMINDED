import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from '@/i18n/translations';

export { translations };

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('epiminded_language');
    return saved === 'fr' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('epiminded_language', lang);
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
