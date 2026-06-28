import { initHeroField } from './hero-field';
import { initReveals } from './reveal';
import { prefersReducedMotion } from './reduced-motion';

function initScrollCue(): () => void {
  const cue = document.querySelector<HTMLElement>('[data-scroll-cue]');
  if (!cue) return () => undefined;

  const revealTimer = window.setTimeout(() => {
    cue.dataset.visible = 'true';
  }, 1300);

  const onScroll = () => {
    const fade = Math.max(0, 1 - window.scrollY / 220);
    cue.style.opacity = String(0.7 * fade);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.clearTimeout(revealTimer);
    window.removeEventListener('scroll', onScroll);
  };
}

function initParallax(): () => void {
  const el = document.querySelector<HTMLElement>('[data-scroll-parallax]');
  if (!el || prefersReducedMotion()) return () => undefined;

  let raf = 0;
  const update = () => {
    raf = 0;
    const rect = el.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const y = (progress - 0.5) * -42;
    el.style.transform = `translateY(${y}px)`;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
  };
}

export function initHome(): () => void {
  const cleanups: Array<() => void> = [];

  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-field]');
  if (canvas) cleanups.push(initHeroField(canvas));

  // Cascade the hero copy in on load.
  const heroReveals = Array.from(document.querySelectorAll<HTMLElement>('[data-hero] .reveal'));
  if (!prefersReducedMotion()) {
    heroReveals.forEach((el, i) => {
      el.style.transitionDelay = `${0.15 + i * 0.08}s`;
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => heroReveals.forEach((el) => el.classList.add('is-visible'))),
    );
  } else {
    heroReveals.forEach((el) => el.classList.add('is-visible'));
  }

  cleanups.push(initReveals());
  cleanups.push(initScrollCue());
  cleanups.push(initParallax());

  return () => {
    cleanups.forEach((fn) => fn());
    heroReveals.forEach((el) => {
      el.style.transitionDelay = '';
    });
  };
}
