export type Language = 'en' | 'es';

export interface TextSegment {
  text: string;
  href?: string;
}

export interface TechCategory {
  label: string;
  logos: {
    alt: string;
    href: string;
    /** icon file to use when the active theme is light (Spanish) */
    forLightTheme: string;
    /** icon file to use when the active theme is dark (English) */
    forDarkTheme: string;
  }[];
}

export interface WorkProject {
  id: string;
  href: string;
  preview: string;
  title: string;
  stack: string;
  stats?: { value: string; label: string }[];
  clientLogos?: { id: string; src: string; alt: string }[];
}

export interface AIProject {
  id: string;
  title: string;
  stack: string;
  /** YouTube video id used both for the thumbnail and the embedded player */
  youtubeId: string;
  liveHref: string;
  repoHref: string;
}

export interface FeaturedClient {
  heading: string;
  description: string;
  href: string;
  preview: string;
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
    aiHeading: string;
    ai: AIProject[];
    featuredClient: FeaturedClient;
    workSubtitle: string;
    work: WorkProject[];
  };
  contact: {
    headline: string;
    emailLabel: string;
    copyLabel: string;
    copiedLabel: string;
    backToTopLabel: string;
    copyrightLabel: string;
  };
}
