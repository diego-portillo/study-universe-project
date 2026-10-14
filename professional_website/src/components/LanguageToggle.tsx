export function LanguageToggle({
  label,
  iconsVisible,
  onToggle,
}: {
  label: string;
  iconsVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`btn-idioma header-icon${iconsVisible ? ' visible' : ''}`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}
