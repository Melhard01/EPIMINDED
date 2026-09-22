import React, { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';
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

/**
 * Layout effects run after the DOM is committed but *before* the browser
 * paints, so switching language here is invisible. A plain useEffect runs
 * after paint, which makes a French visitor see a frame of English first.
 * React warns if useLayoutEffect is called during the build-time render, so
 * fall back to useEffect there — it never runs on the server anyway.
 */
const useBeforePaint =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Always starts at the default so the prerendered HTML and the first client
  // render agree. Reading localStorage in the initializer instead would (a)
  // crash the build-time render, where there is no localStorage, and (b)
  // produce a hydration mismatch for anyone whose stored language is 'fr'.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useBeforePaint(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') setLanguageState(saved);
  }, []);

  // index.html hides #root for visitors who chose French, so the prerendered
  // English is never painted. Reveal it once the French render has committed —
  // still before paint — or straight away for everyone else.
  useBeforePaint(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable: nothing was hidden */
    }
    if (language === 'fr' || stored !== 'fr') {
      document.documentElement.removeAttribute('data-lang-pending');
    }
  }, [language]);

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
