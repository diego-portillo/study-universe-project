import type { SiteContent } from '../content/types';
import { scrollToSection } from '../scrollToSection';
import { ChevronRightIcon } from '../icons';

interface SidebarProps {
  nav: SiteContent['nav'];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ nav, isOpen, onClose }: SidebarProps) {
  const links: [string, string][] = [
    ['home', nav.home],
    ['about', nav.about],
    ['skills', nav.technologies],
    ['projects', nav.projects],
    ['contact', nav.contact],
  ];

  function handleLinkClick(id: string) {
    onClose();
    scrollToSection(id);
  }

  return (
    <aside className={`sidebar${isOpen ? ' show-sidebar' : ''}`}>
      <div>
        <button className="close-btn" onClick={onClose} aria-label="Close menu">
          <ChevronRightIcon />
        </button>
        <ul className="sidebar-links">
          {links.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(id);
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
