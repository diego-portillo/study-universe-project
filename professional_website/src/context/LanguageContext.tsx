import { useEffect, useState, type ReactNode } from 'react';
import type { Language, SiteContent } from '../content/types';
import { en } from '../content/en';
import { es } from '../content/es';
import { LanguageContext } from './languageContextInstance';

const contentByLanguage: Record<Language, SiteContent> = { en, es };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang((current) => (current === 'en' ? 'es' : 'en'));
  };

  return (
    <LanguageContext.Provider
      value={{ lang, content: contentByLanguage[lang], toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
