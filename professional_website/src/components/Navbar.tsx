import { useFixedNavbar } from '../hooks/useFixedNavbar';
import { MenuIcon } from '../icons';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const isFixed = useFixedNavbar();

  return (
    <nav id="navbar-container" className={isFixed ? 'navbar-fixed' : ''}>
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
