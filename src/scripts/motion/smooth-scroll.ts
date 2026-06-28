import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Physics-based smooth scrolling (Lenis) wired into GSAP's ticker so that
 * ScrollTrigger animations and the scroll position share a single clock.
 * This is what makes scroll-driven motion feel cinematic instead of jumpy.
 */
export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => undefined;

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  });
  lenisInstance = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  const onTick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);

  document.documentElement.classList.add('lenis');

  return () => {
    gsap.ticker.remove(onTick);
    lenis.destroy();
    lenisInstance = null;
    document.documentElement.classList.remove('lenis');
  };
}
