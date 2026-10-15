export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const position = element.offsetTop - 72;
  window.scrollTo({ left: 0, top: position, behavior: 'smooth' });
}
