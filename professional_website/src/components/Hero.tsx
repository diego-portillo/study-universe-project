import { useEffect } from 'react';
import type { SiteContent } from '../content/types';
import { useTypewriter } from '../hooks/useTypewriter';
import { scrollToSection } from '../scrollToSection';
import { LinkedInIcon, GitHubIcon, MailIcon, ChevronDownIcon } from '../icons';
import { LINKEDIN_URL, GITHUB_URL, EMAIL_HREF } from '../constants';

export function Hero({
  hero,
  onIconsVisible,
}: {
  hero: SiteContent['hero'];
  onIconsVisible: (visible: boolean) => void;
}) {
  const typewriter = useTypewriter(hero.titleLines, hero.subtitleParts);

  useEffect(() => {
    onIconsVisible(typewriter.iconsVisible);
  }, [typewriter.iconsVisible, onIconsVisible]);

  const iconClass = (extra: string) =>
    `${extra} header-icon${typewriter.iconsVisible ? ' visible' : ''}`;

  return (
    <header className="hero" id="home">
      <div className="section-center hero-center">
        <div className="hero-title typewriter-text" id="hero-title1">
          {typewriter.title1}
        </div>
        <div className="hero-title typewriter-text" id="hero-title2">
          <span
            className={
              typewriter.title2Started
                ? 'text-background'
                : 'text-background hidden'
            }
          >
            {typewriter.title2}
          </span>
        </div>
        <div className="typewriter-text" id="hero-subtitle">
          {hero.subtitleParts.map((_, index) => {
            const started = typewriter.subtitleStarted[index];
            const isHighlighted = index % 2 === 1;
            const classes = [
              started ? '' : 'hidden',
              isHighlighted ? 'text-background' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <span key={index} className={classes}>
                {typewriter.subtitleTexts[index]}
              </span>
            );
          })}
        </div>
        <ul className="social-icons">
          <li>
            <a href={LINKEDIN_URL} className={iconClass('social-icon')}>
              <LinkedInIcon />
            </a>
          </li>
          <li>
            <a href={GITHUB_URL} className={iconClass('social-icon')}>
              <GitHubIcon />
            </a>
          </li>
          <li>
            <a href={EMAIL_HREF} className={iconClass('social-icon')}>
              <MailIcon />
            </a>
          </li>
        </ul>
        <a
          href="#about"
          className={iconClass('header-arrow')}
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('about');
          }}
        >
          <ChevronDownIcon />
        </a>
      </div>
    </header>
  );
}
