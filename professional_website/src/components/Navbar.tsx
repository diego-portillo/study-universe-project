import { useFixedNavbar } from '../hooks/useFixedNavbar';
import { scrollToSection } from '../scrollToSection';
import { MenuIcon } from '../icons';

export function Navbar({
  onOpenSidebar,
  iconsVisible,
}: {
  onOpenSidebar: () => void;
  iconsVisible: boolean;
}) {
  const isFixed = useFixedNavbar();

  return (
    <nav id="navbar-container" className={isFixed ? 'navbar-fixed' : ''}>
      <a
        href="#home"
        id="nav-logo-container"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('home');
        }}
      >
        <img
          loading="lazy"
          src="/images/logo-2024.png"
          className={`nav-logo header-icon${iconsVisible ? ' visible' : ''}`}
          alt="nav logo"
        />
      </a>
      <div id="nav-buttons-container">
        <button
          className="nav-btn"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>
    </nav>
  );
}
