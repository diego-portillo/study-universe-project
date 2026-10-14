export type Language = 'en' | 'es';

export interface TextSegment {
  text: string;
  href?: string;
}

export interface TechCategory {
  label: string;
  logos: {
    alt: string;
    /** icon file to use when the active theme is light (Spanish) */
    forLightTheme: string;
    /** icon file to use when the active theme is dark (English) */
    forDarkTheme: string;
  }[];
}

export interface WorkProject {
  id: string;
  orientation: 'horizontal' | 'vertical';
  /** DOM order: the original markup doesn't always put the display before the info block */
  displayFirst: boolean;
  href: string;
  logo: string;
  logoId?: string;
  preview: string;
  title: string;
  stack: string;
  clientLogos?: { id: string; src: string; alt: string }[];
}

export interface PersonalProject extends WorkProject {
  demoHref?: string;
  demoLabel?: string;
}

export interface SiteContent {
  nav: {
    home: string;
    about: string;
    technologies: string;
    projects: string;
    contact: string;
  };
  languageToggleLabel: string;
  hero: {
    titleLines: [string, string];
    subtitleParts: string[];
  };
  about: {
    heading: string;
    cvLabel: string;
    paragraphs: TextSegment[][];
  };
  technologies: {
    heading: string;
    categories: TechCategory[];
  };
  projects: {
    heading: string;
    workSubtitle: string;
    work: WorkProject[];
    personalHeading: string;
    personal: PersonalProject[];
  };
  contact: {
    availabilityLabel: string;
    headline: string;
    emailLabel: string;
    copyLabel: string;
    copiedLabel: string;
    copyrightLabel: string;
  };
}
