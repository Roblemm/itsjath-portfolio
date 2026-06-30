import { initNav } from './nav';
import { initHome } from './home';
import { initPageIntro } from './page-intro';
import { initReveals } from './reveal';
import { getLenis, initSmoothScroll } from './smooth-scroll';
import { initWorkIconMotion } from './work-icons';

function isHome(): boolean {
  const path = window.location.pathname;
  return path === '/' || path === '';
}

function boot(): () => void {
  const cleanups: Array<() => void> = [initSmoothScroll(), initNav()];

  if (isHome()) {
    cleanups.push(initHome());
  } else {
    cleanups.push(initPageIntro());
    cleanups.push(initReveals());
    cleanups.push(initWorkIconMotion());
  }

  return () => cleanups.forEach((fn) => fn());
}

let cleanup: (() => void) | undefined;

function start() {
  cleanup?.();
  window.scrollTo(0, 0);
  getLenis()?.scrollTo(0, { immediate: true });
  cleanup = boot();
}

document.addEventListener('astro:page-load', start);
document.addEventListener('astro:before-swap', () => {
  cleanup?.();
  cleanup = undefined;
});

if (document.readyState !== 'loading') {
  start();
} else {
  document.addEventListener('DOMContentLoaded', start);
}
