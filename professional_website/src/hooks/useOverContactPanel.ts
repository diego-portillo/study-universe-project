import { useEffect, useState } from 'react';

const BOTTOM_OVERLAP_THRESHOLD_PX = 110;

export function useOverContactPanel(): boolean {
  const [isOverPanel, setIsOverPanel] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const contact = document.getElementById('contact');
      if (!contact) return;
      const contactTop = contact.getBoundingClientRect().top;
      setIsOverPanel(contactTop < window.innerHeight - BOTTOM_OVERLAP_THRESHOLD_PX);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return isOverPanel;
}
