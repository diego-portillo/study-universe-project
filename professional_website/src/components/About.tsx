import { useRef } from 'react';
import type { SiteContent } from '../content/types';
import { useSectionFadeIn } from '../hooks/useSectionFadeIn';
import { scrollToSection } from '../scrollToSection';
import { ChevronDownIcon } from '../icons';

export function About({ about }: { about: SiteContent['about'] }) {
  const ref = useRef<HTMLElement>(null);
  useSectionFadeIn(ref);

  return (
    <section className="section about" id="about" ref={ref}>
      <div className="section-center about-center">
        <div className="section-title about-title">
          <h2>{about.heading}</h2>
          <a
            href="/Diego_Portillo_CV_EN_ES.pdf"
            className="btn hero-btn"
            download
          >
            {about.cvLabel}
          </a>
        </div>

        <div id="about-description-container">
          {about.paragraphs.map((paragraph, index) => (
            <p key={index}>
              {paragraph.map((segment, segmentIndex) =>
                segment.href ? (
                  <a key={segmentIndex} href={segment.href}>
                    {segment.text}
                  </a>
                ) : (
                  <span key={segmentIndex}>{segment.text}</span>
                ),
              )}
            </p>
          ))}
        </div>

        <a
          href="#skills"
          className="nav-link header-arrow arrow-down"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('skills');
          }}
        >
          <ChevronDownIcon />
        </a>
      </div>
    </section>
  );
}
