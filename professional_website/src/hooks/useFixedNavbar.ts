import { useEffect, useState } from 'react';

const FIXED_SCROLL_THRESHOLD_PX = 80;

export function useFixedNavbar(): boolean {
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsFixed(window.pageYOffset > FIXED_SCROLL_THRESHOLD_PX);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isFixed;
}
