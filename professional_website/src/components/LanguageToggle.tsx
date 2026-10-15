import { useOverContactPanel } from '../hooks/useOverContactPanel';

export function LanguageToggle({
  label,
  iconsVisible,
  onToggle,
}: {
  label: string;
  iconsVisible: boolean;
  onToggle: () => void;
}) {
  const isOverContactPanel = useOverContactPanel();

  return (
    <button
      className={`btn-idioma header-icon${iconsVisible ? ' visible' : ''}${isOverContactPanel ? ' on-contact-panel' : ''}`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
