/** Navigation: solidify on scroll + mobile menu toggle. */
export function initNav(): () => void {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return () => undefined;

  const onScroll = () => {
    nav.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = nav.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const setOpen = (open: boolean) => {
    nav.dataset.open = open ? 'true' : 'false';
    toggle?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  const onToggle = () => setOpen(nav.dataset.open !== 'true');
  toggle?.addEventListener('click', onToggle);

  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a'));
  const closeMenu = () => setOpen(false);
  links.forEach((link) => link.addEventListener('click', closeMenu));

  return () => {
    window.removeEventListener('scroll', onScroll);
    toggle?.removeEventListener('click', onToggle);
    links.forEach((link) => link.removeEventListener('click', closeMenu));
    document.body.style.overflow = '';
  };
}
