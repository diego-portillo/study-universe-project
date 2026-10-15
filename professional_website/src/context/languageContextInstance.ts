import { createContext } from 'react';
import type { Language, SiteContent } from '../content/types';

export interface LanguageContextValue {
  lang: Language;
  content: SiteContent;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
