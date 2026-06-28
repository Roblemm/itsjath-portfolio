import { initNav } from './nav';
import { initHome } from './home';
import { initReveals } from './reveal';

function isHome(): boolean {
  const path = window.location.pathname;
  return path === '/' || path === '';
}

function boot(): () => void {
  const cleanups: Array<() => void> = [initNav()];

  if (isHome()) {
    cleanups.push(initHome());
  } else {
    cleanups.push(initReveals());
  }

  return () => cleanups.forEach((fn) => fn());
}

let cleanup: (() => void) | undefined;

function start() {
  cleanup?.();
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
