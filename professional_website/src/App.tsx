import { useCallback, useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { useLanguage } from './hooks/useLanguage';
import { useSidebar } from './hooks/useSidebar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LanguageToggle } from './components/LanguageToggle';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Technologies } from './components/Technologies';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';

function AppContent() {
  const { lang, content, toggleLanguage } = useLanguage();
  const sidebar = useSidebar();
  const [iconsVisible, setIconsVisible] = useState(false);
  const handleIconsVisible = useCallback(
    (visible: boolean) => setIconsVisible(visible),
    [],
  );

  return (
    <>
      <Navbar onOpenSidebar={sidebar.open} iconsVisible={iconsVisible} />
      <LanguageToggle
        label={content.languageToggleLabel}
        iconsVisible={iconsVisible}
        onToggle={toggleLanguage}
      />
      <Sidebar
        nav={content.nav}
        isOpen={sidebar.isOpen}
        onClose={sidebar.close}
      />
      <Hero hero={content.hero} onIconsVisible={handleIconsVisible} />
      <About about={content.about} />
      <Technologies technologies={content.technologies} lang={lang} />
      <Projects projects={content.projects} />
      <Contact contact={content.contact} lang={lang} />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
