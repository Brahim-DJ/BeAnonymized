import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Translations } from './types.ts';
import { getLanguage, languages } from './translations/index.ts';

interface LanguageContextValue {
  t: Translations;
  language: string;
  setLanguage: (code: string) => void;
}

const STORAGE_KEY = 'confidia-lang';

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && languages.some((l) => l.code === stored)) return stored;

  return 'ar';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(detectLanguage);

  const setLanguage = (code: string) => {
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = getLanguage(language).translations;

  return (
    <LanguageContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslation must be used within LanguageProvider');
  return ctx;
}
