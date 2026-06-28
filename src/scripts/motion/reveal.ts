import { prefersReducedMotion } from './reduced-motion';

/**
 * Reveals elements with the `.reveal` class as they scroll into view.
 * Reduced-motion users get everything shown immediately.
 */
export function initReveals(root: ParentNode = document): () => void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));
  if (!els.length) return () => undefined;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return () => undefined;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
