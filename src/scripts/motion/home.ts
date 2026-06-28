import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroField } from './hero-field';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

/** Wrap each word of an element in a span so it can be animated individually. */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') {
    return Array.from(el.querySelectorAll<HTMLElement>('.word'));
  }
  const text = (el.textContent ?? '').trim();
  el.textContent = '';
  const words = text.split(/\s+/);
  const spans: HTMLElement[] = [];
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    spans.push(span);
  });
  el.dataset.split = 'done';
  return spans;
}

function formatCount(value: number, format: string): string {
  if (format === 'comma') return Math.round(value).toLocaleString('en-US');
  return String(Math.round(value));
}

function setCountersFinal() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.countTo ?? '0');
    const suffix = el.dataset.countSuffix ?? '';
    const format = el.dataset.countFormat ?? 'plain';
    el.textContent = formatCount(to, format) + suffix;
  });
}

function initScrollCue(): () => void {
  const cue = document.querySelector<HTMLElement>('[data-scroll-cue]');
  if (!cue) return () => undefined;
  const timer = window.setTimeout(() => (cue.dataset.visible = 'true'), 1200);
  const onScroll = () => {
    cue.style.opacity = String(0.7 * Math.max(0, 1 - window.scrollY / 220));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
  };
}

export function initHome(): () => void {
  const cleanups: Array<() => void> = [];

  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-field]');
  const field = canvas ? initHeroField(canvas) : null;
  if (field) cleanups.push(field.destroy);

  cleanups.push(initScrollCue());

  // ── Reduced motion: show everything, no scroll choreography ──
  if (prefersReducedMotion()) {
    document
      .querySelectorAll<HTMLElement>('[data-hero-stagger], [data-reveal]')
      .forEach((el) => el.classList.add('is-in'));
    document.querySelectorAll<HTMLElement>('[data-split] .word, [data-split]').forEach((el) => {
      el.style.opacity = '1';
    });
    const splitEl = document.querySelector<HTMLElement>('[data-split]');
    if (splitEl) splitWords(splitEl).forEach((w) => (w.style.opacity = '1'));
    const fade = document.querySelector<HTMLElement>('[data-split-fade]');
    if (fade) fade.style.opacity = '1';
    const fv = document.querySelector<HTMLElement>('[data-featured-visual]');
    if (fv) gsap.set(fv, { clearProps: 'all' });
    setCountersFinal();
    field?.setScroll(0);
    return () => cleanups.forEach((fn) => fn());
  }

  const ctx = gsap.context(() => {
    // ── Hero entrance ──
    gsap.set('[data-hero-stagger]', { y: 26, opacity: 0 });
    gsap.to('[data-hero-stagger]', {
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.085,
      delay: 0.15,
    });

    // ── Drive the canvas field with overall scroll through the first scenes ──
    if (field) {
      ScrollTrigger.create({
        trigger: '[data-home]',
        start: 'top top',
        end: () => `+=${window.innerHeight * 3}`,
        scrub: true,
        onUpdate: (self) => field.setScroll(self.progress),
      });
    }

    // ── Hero copy drifts up and fades as you leave the scene ──
    gsap.to('[data-hero-copy]', {
      yPercent: -16,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-hero]',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // ── Manifesto: words ignite one by one as the pinned scene scrolls ──
    const manifesto = document.querySelector<HTMLElement>('[data-manifesto]');
    const splitEl = manifesto?.querySelector<HTMLElement>('[data-split]');
    const fade = manifesto?.querySelector<HTMLElement>('[data-split-fade]');
    if (manifesto && splitEl) {
      const words = splitWords(splitEl);
      gsap.set(words, { opacity: 0.14, filter: 'blur(0px)' });
      if (fade) gsap.set(fade, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: manifesto,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      });
      tl.to(words, { opacity: 1, stagger: 0.5, ease: 'none', duration: 1 }, 0);
      if (fade) tl.to(fade, { opacity: 1, duration: 0.4 }, '>-0.2');
    }

    // ── Stats count up on entry ──
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      const to = Number(el.dataset.countTo ?? '0');
      const suffix = el.dataset.countSuffix ?? '';
      const format = el.dataset.countFormat ?? 'plain';
      const proxy = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(proxy, {
            v: to,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = formatCount(proxy.v, format) + suffix;
            },
          });
        },
      });
    });

    // ── Generic reveals ──
    gsap.set('[data-reveal]', { y: 28, opacity: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      onEnter: (els) =>
        gsap.to(els, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
          overwrite: true,
        }),
    });

    // ── Featured: visual scales/clips open, copy rises (pinned scene) ──
    const featured = document.querySelector<HTMLElement>('[data-featured]');
    const visual = featured?.querySelector<HTMLElement>('[data-featured-visual]');
    const body = featured?.querySelector<HTMLElement>('[data-featured-body]');
    if (featured && visual) {
      gsap.set(visual, { scale: 1.18, clipPath: 'inset(22% 14% round 24px)' });
      gsap.to(visual, {
        scale: 1,
        clipPath: 'inset(0% 0% round 24px)',
        ease: 'none',
        scrollTrigger: {
          trigger: featured,
          start: 'top top',
          end: 'center center',
          scrub: true,
        },
      });
      if (body) {
        gsap.from(body.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: featured, start: 'top 40%' },
        });
      }
    }

    ScrollTrigger.refresh();
  });

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));
  cleanups.push(() => ctx.revert());

  return () => cleanups.forEach((fn) => fn());
}
