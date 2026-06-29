import gsap from 'gsap';
import { getLenis } from './smooth-scroll';
import { prefersReducedMotion } from './reduced-motion';

function setScrollLocked(locked: boolean) {
  const lenis = getLenis();
  if (locked) {
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
    lenis?.start();
  }
}

function revealContent() {
  const content = document.querySelector<HTMLElement>('[data-page-content]');
  if (!content) return;
  gsap.fromTo(
    content,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', clearProps: 'transform' },
  );
}

function lineText(line: HTMLElement): string {
  return line.querySelector('.page-intro__text')?.textContent?.trim() ?? line.textContent?.trim() ?? '';
}

function animateFade(lines: HTMLElement[], skip: HTMLElement | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.set(lines, { opacity: 0, y: 28 })
    .to(skip, { opacity: 0.45, duration: 0.4 }, 0.35)
    .to(lines, { opacity: 1, y: 0, duration: 0.75, stagger: 0.22, ease: 'power3.out' }, 0.2);
  return tl;
}

function animateSlide(lines: HTMLElement[], skip: HTMLElement | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  tl.set(lines, { opacity: 0, x: -48 })
    .to(skip, { opacity: 0.45, duration: 0.4 }, 0.4)
    .to(
      lines,
      {
        opacity: 1,
        x: 0,
        duration: 0.85,
        stagger: 0.18,
        ease: 'power3.out',
      },
      0.15,
    );
  return tl;
}

function animateType(lines: HTMLElement[], skip: HTMLElement | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  const targets = lines.map((line) => {
    const textEl = line.querySelector<HTMLElement>('.page-intro__text') ?? line;
    const text = lineText(line);
    textEl.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'page-intro__cursor';
    cursor.setAttribute('aria-hidden', 'true');
    textEl.appendChild(cursor);
    return { el: textEl, text, cursor };
  });

  tl.to(skip, { opacity: 0.45, duration: 0.4 }, 0.5);

  targets.forEach(({ el, text, cursor }, lineIndex) => {
    const proxy = { i: 0 };
    tl.to(
      proxy,
      {
        i: text.length,
        duration: Math.max(0.55, text.length * 0.045),
        ease: 'none',
        onUpdate: () => {
          const count = Math.round(proxy.i);
          el.textContent = text.slice(0, count);
          el.appendChild(cursor);
        },
      },
      lineIndex === 0 ? 0.2 : '+=0.25',
    );
    tl.to(cursor, { opacity: 0, duration: 0.15 }, '>-0.05');
  });

  return tl;
}

function animateSplit(lines: HTMLElement[], skip: HTMLElement | null): gsap.core.Timeline {
  const tl = gsap.timeline();
  const masks = lines.map((line) => {
    const textEl = line.querySelector<HTMLElement>('.page-intro__text') ?? line;
    const wrap = document.createElement('span');
    wrap.className = 'page-intro__mask';
    const inner = document.createElement('span');
    inner.className = 'page-intro__text';
    inner.textContent = lineText(line);
    textEl.replaceWith(wrap);
    wrap.appendChild(inner);
    line.appendChild(wrap);
    return inner;
  });

  tl.set(masks, { yPercent: 110, opacity: 0 })
    .to(skip, { opacity: 0.45, duration: 0.4 }, 0.45)
    .to(
      masks,
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.14,
        ease: 'power3.out',
      },
      0.12,
    );
  return tl;
}

/**
 * Short cinematic intro when opening inner pages (not home).
 */
export function initPageIntro(): () => void {
  const intro = document.querySelector<HTMLElement>('[data-page-intro]');
  if (!intro) return () => undefined;

  const lines = Array.from(intro.querySelectorAll<HTMLElement>('[data-page-intro-line]'));
  const skip = intro.querySelector<HTMLButtonElement>('[data-page-intro-skip]');
  const variant = intro.dataset.variant ?? 'fade';

  if (prefersReducedMotion()) {
    intro.remove();
    document.body.removeAttribute('data-page-intro-pending');
    return () => undefined;
  }

  setScrollLocked(true);
  document.body.dataset.pageIntroPending = 'true';
  gsap.set('[data-page-content]', { opacity: 0 });

  let finished = false;
  let tl: gsap.core.Timeline | null = null;

  const finish = () => {
    if (finished) return;
    finished = true;
    tl?.kill();
    gsap.killTweensOf([intro, ...lines, skip]);

    intro.remove();
    document.body.removeAttribute('data-page-intro-pending');
    setScrollLocked(false);
    revealContent();
  };

  const buildTimeline = () => {
    switch (variant) {
      case 'slide':
        return animateSlide(lines, skip);
      case 'type':
        return animateType(lines, skip);
      case 'split':
        return animateSplit(lines, skip);
      default:
        return animateFade(lines, skip);
    }
  };

  tl = buildTimeline();
  tl.to(intro, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, '+=0.55').add(finish);

  const onSkip = () => finish();
  skip?.addEventListener('click', onSkip);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      finish();
    }
  };
  window.addEventListener('keydown', onKey);

  return () => {
    skip?.removeEventListener('click', onSkip);
    window.removeEventListener('keydown', onKey);
    setScrollLocked(false);
    tl?.kill();
  };
}
