import { useRef } from 'react';
import type { Language, SiteContent } from '../content/types';
import { useSectionFadeIn } from '../hooks/useSectionFadeIn';
import { scrollToSection } from '../scrollToSection';
import { ChevronDownIcon } from '../icons';

export function Technologies({
  technologies,
  lang,
}: {
  technologies: SiteContent['technologies'];
  lang: Language;
}) {
  const ref = useRef<HTMLElement>(null);
  useSectionFadeIn(ref);

  return (
    <section className="section skills" id="skills" ref={ref}>
      <div className="section-title" id="skills-title">
        <h2>{technologies.heading}</h2>
      </div>

      <div className="section-center">
        <article className="technologies">
          {technologies.categories.map((category) => (
            <div className="tech-type" key={category.label}>
              <h3>{category.label}</h3>
              <div className="logos-container">
                {category.logos.map((logo) => (
                  <a
                    key={logo.alt}
                    className="tech-logo-link"
                    href={logo.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={logo.alt}
                  >
                    <img
                      loading="lazy"
                      className="tech-logo"
                      src={`/images/${lang === 'en' ? logo.forDarkTheme : logo.forLightTheme}`}
                      alt={logo.alt}
                    />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </article>
        <a
          href="#projects"
          className="nav-link header-arrow arrow-down"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('projects');
          }}
        >
          <ChevronDownIcon />
        </a>
      </div>
    </section>
  );
}
