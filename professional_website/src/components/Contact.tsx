import { useState } from 'react';
import type { Language, SiteContent } from '../content/types';
import { scrollToSection } from '../scrollToSection';
import { LinkedInIcon, GitHubIcon, MailIcon, CopyIcon } from '../icons';
import { LINKEDIN_URL, GITHUB_URL, EMAIL, EMAIL_HREF } from '../constants';

const COPIED_LABEL_DURATION_MS = 2000;
const CURRENT_YEAR = new Date().getFullYear();

export function Contact({
  contact,
  lang,
}: {
  contact: SiteContent['contact'];
  lang: Language;
}) {
  const [justCopied, setJustCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(EMAIL);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPIED_LABEL_DURATION_MS);
  }

  return (
    <div id="contact">
      <div id="contact-text">
        <a href={EMAIL_HREF} className="availability">
          <div className="circle" />
          <span className="rem1">{contact.availabilityLabel}</span>
        </a>
        <h1>{contact.headline}</h1>
        <h4 id="email-label">{contact.emailLabel}</h4>
        <div style={{ width: '100%' }}>
          <h3 id="email-value">{EMAIL}</h3>
          <span
            className="availability rem1"
            onClick={handleCopy}
            id="clipboard-copy"
          >
            <CopyIcon style={{ margin: '1rem' }} />
            {justCopied ? contact.copiedLabel : contact.copyLabel}
          </span>
        </div>
        <div className="footer-container">
          <ul className="footer-icons">
            <li>
              <a href={LINKEDIN_URL} className="social-icon">
                <LinkedInIcon />
              </a>
            </li>
            <li>
              <a href={GITHUB_URL} className="social-icon">
                <GitHubIcon />
              </a>
            </li>
            <li>
              <a href={EMAIL_HREF} className="social-icon">
                <MailIcon />
              </a>
            </li>
          </ul>
          <p className="text-center" id="copyright">
            &copy; {CURRENT_YEAR} {contact.copyrightLabel}
          </p>
        </div>
      </div>
      <a
        href="#home"
        className="background-image"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('home');
        }}
      >
        <img
          loading="lazy"
          src={`/images/logo-pixel${lang === 'es' ? '-white' : ''}.svg`}
          alt=""
        />
      </a>
    </div>
  );
}
