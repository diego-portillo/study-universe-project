export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const position = element.offsetTop - 62;
  window.scrollTo({ left: 0, top: position, behavior: 'smooth' });
}
