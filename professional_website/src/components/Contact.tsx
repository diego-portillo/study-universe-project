import { useState } from 'react';
import type { SiteContent } from '../content/types';
import { scrollToSection } from '../scrollToSection';
import {
  LinkedInIcon,
  GitHubIcon,
  MailIcon,
  CopyIcon,
  ArrowUpIcon,
} from '../icons';
import { LINKEDIN_URL, GITHUB_URL, EMAIL, EMAIL_HREF } from '../constants';

const COPIED_LABEL_DURATION_MS = 2000;
const CURRENT_YEAR = new Date().getFullYear();

export function Contact({ contact }: { contact: SiteContent['contact'] }) {
  const [justCopied, setJustCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(EMAIL);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPIED_LABEL_DURATION_MS);
  }

  return (
    <div id="contact">
      <div id="contact-text">
        <h1>{contact.headline}</h1>
        <h4 id="email-label">{contact.emailLabel}</h4>
        <div id="email-row">
          <h3 id="email-value">{EMAIL}</h3>
          <button
            type="button"
            id="email-copy-icon"
            onClick={handleCopy}
            aria-label={justCopied ? contact.copiedLabel : contact.copyLabel}
            title={justCopied ? contact.copiedLabel : contact.copyLabel}
          >
            <CopyIcon />
          </button>
        </div>
        <span
          className="availability rem1"
          onClick={() => scrollToSection('home')}
          id="back-to-top"
        >
          <ArrowUpIcon style={{ margin: '1rem' }} />
          {contact.backToTopLabel}
        </span>
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
    </div>
  );
}
