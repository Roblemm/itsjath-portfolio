import { initHomeIntro, initPageEntrance } from './home';
import { signal } from './signal';
import { prefersReducedMotion } from './reduced-motion';

type RouteId = 'home' | 'work' | 'case-study' | 'about' | 'contact';

function getRouteId(): RouteId {
  const path = window.location.pathname;
  if (path === '/' || path === '') return 'home';
  if (path.startsWith('/work/escape-bruno-head')) return 'case-study';
  if (path.startsWith('/work')) return 'work';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/contact')) return 'contact';
  return 'home';
}

function initRoute(route: RouteId) {
  const signalRoot = document.querySelector<HTMLElement>('[data-signal]');
  if (!signalRoot) return;

  if (route !== 'home') {
    signal.mount(signalRoot);
    signal.show();
    if (route === 'work') {
      signal.setState('gold');
    } else if (route === 'about') {
      signal.setState('soft');
    } else if (route === 'contact') {
      signal.setState('purple');
    }
    initPageEntrance('[data-page-content]');
  }
}

export function initMotion() {
  const route = getRouteId();

  if (route === 'home') {
    const overlay = document.querySelector<HTMLElement>('[data-intro-overlay]');
    const skipBtn = document.querySelector<HTMLButtonElement>('[data-intro-skip]');
    const heroContent = document.querySelector<HTMLElement>('[data-hero-content]');
    const line1 = document.querySelector<HTMLElement>('[data-intro-line="1"]');
    const line2 = document.querySelector<HTMLElement>('[data-intro-line="2"]');
    const finalLine = document.querySelector<HTMLElement>('[data-intro-final]');
    const heroDot = document.querySelector<HTMLElement>('[data-hero-dot]');

    if (overlay && skipBtn && heroContent && line1 && line2 && finalLine && heroDot) {
      return initHomeIntro({
        overlay,
        skipBtn,
        heroContent,
        line1,
        line2,
        finalLine,
        heroDot,
      });
    }
  } else {
    initRoute(route);
  }

  return () => signal.destroy();
}

document.addEventListener('astro:page-load', () => {
  initMotion();
});

if (!prefersReducedMotion()) {
  document.addEventListener('astro:before-preparation', () => {
    signal.destroy();
  });
}
