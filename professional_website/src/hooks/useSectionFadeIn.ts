import { useEffect, type RefObject } from 'react';

/** Adds the 'show' class the first time the section scrolls into view, then stops observing it. */
export function useSectionFadeIn(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}
