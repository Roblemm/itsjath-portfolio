import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHeroField } from './hero-field';
import { initHomeIntro } from './home-intro';
import { prefersReducedMotion } from './reduced-motion';
import { initSignalScroll } from './signal-scroll';

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

function runHeroEntrance(onComplete?: () => void) {
  gsap.set('[data-hero-stagger]', { y: 26, opacity: 0 });
  gsap.to('[data-hero-stagger]', {
    y: 0,
    opacity: 1,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.085,
    delay: 0.08,
    onComplete,
  });
}

function sortReadingOrder(elements: HTMLElement[]): HTMLElement[] {
  return [...elements].sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    if (Math.abs(ra.top - rb.top) > 10) return ra.top - rb.top;
    return ra.left - rb.left;
  });
}

function initScrollChoreography(field: ReturnType<typeof initHeroField> | null) {
  return gsap.context(() => {
    if (field) {
      ScrollTrigger.create({
        trigger: '[data-home]',
        start: 'top top',
        end: () => `+=${window.innerHeight * 3}`,
        scrub: true,
        onUpdate: (self) => field.setScroll(self.progress),
      });
    }

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

    const manifesto = document.querySelector<HTMLElement>('[data-manifesto]');
    const splitEl = manifesto?.querySelector<HTMLElement>('[data-split]');
    const fade = manifesto?.querySelector<HTMLElement>('[data-split-fade]');
    if (manifesto && splitEl) {
      const words = splitWords(splitEl);
      gsap.set(words, { opacity: 0.14, filter: 'blur(0px)' });
      if (fade) gsap.set(fade, { opacity: 0 });

      let readingOrder = sortReadingOrder(words);
      const resortWords = () => {
        readingOrder = sortReadingOrder(words);
      };
      resortWords();
      requestAnimationFrame(resortWords);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: manifesto,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onRefresh: resortWords,
        },
      });
      tl.to(readingOrder, { opacity: 1, stagger: 0.06, ease: 'none', duration: 1 }, 0);
      if (fade) tl.to(fade, { opacity: 1, duration: 0.4 }, '>-0.15');
    }

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

    const featured = document.querySelector<HTMLElement>('[data-featured]');
    const visual = featured?.querySelector<HTMLElement>('[data-featured-visual]');
    const body = featured?.querySelector<HTMLElement>('[data-featured-body]');
    if (featured && visual) {
      gsap.set(visual, {
        scale: 1.18,
        clipPath: 'inset(22% 14% round 24px)',
        opacity: 0.25,
      });
      if (body) gsap.set(body, { opacity: 0, y: 40 });

      const ft = gsap.timeline({
        scrollTrigger: {
          trigger: featured,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      });

      ft.to(
        visual,
        {
          scale: 1,
          clipPath: 'inset(0% 0% round 24px)',
          opacity: 1,
          ease: 'none',
          duration: 1,
        },
        0,
      );

      if (body) {
        ft.to(
          body,
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            duration: 0.5,
          },
          0.4,
        );
      }
    }

    ScrollTrigger.refresh();
  });
}

export function initHome(): () => void {
  const cleanups: Array<() => void> = [];

  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-field]');
  const field = canvas ? initHeroField(canvas) : null;
  if (field) cleanups.push(field.destroy);

  cleanups.push(initScrollCue());

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
    const fb = document.querySelector<HTMLElement>('[data-featured-body]');
    if (fb) gsap.set(fb, { clearProps: 'all', opacity: 1, y: 0 });
    setCountersFinal();
    field?.setScroll(0);
    document.querySelector('[data-intro]')?.remove();
    document.querySelector('[data-home]')?.removeAttribute('data-intro-pending');
    cleanups.push(initSignalScroll());
    return () => cleanups.forEach((fn) => fn());
  }

  let scrollCtx: gsap.Context | null = null;

  const beginExperience = (instant = false) => {
    const mountSignal = () => {
      cleanups.push(initSignalScroll({ initialProgress: 0 }));
      ScrollTrigger.refresh();
    };

    if (instant) {
      gsap.set('[data-hero-stagger]', { y: 0, opacity: 1 });
      mountSignal();
    } else {
      runHeroEntrance(mountSignal);
    }

    scrollCtx = initScrollChoreography(field);
    cleanups.push(() => scrollCtx?.revert());
  };

  cleanups.push(
    initHomeIntro({
      onComplete: beginExperience,
    }),
  );

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);
  cleanups.push(() => window.removeEventListener('resize', onResize));

  return () => cleanups.forEach((fn) => fn());
}
