import gsap from 'gsap';
import { getLenis } from './smooth-scroll';
import { prefersReducedMotion } from './reduced-motion';

export interface HomeIntroDeps {
  onComplete: (instant?: boolean) => void;
}

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

function heroRestPosition(): { x: number; y: number } {
  const anchor = document.querySelector<HTMLElement>('.signal-waypoint--hero-start');
  const r = anchor?.getBoundingClientRect();
  if (r && r.width >= 0) {
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
  }
  return {
    x: window.innerWidth * 0.88,
    y: window.innerHeight * 0.44,
  };
}

function hasPlayedThisSession(): boolean {
  try {
    return window.sessionStorage.getItem('home-intro-played') === 'true';
  } catch {
    return false;
  }
}

function markPlayedThisSession() {
  try {
    window.sessionStorage.setItem('home-intro-played', 'true');
  } catch {
    // Storage can be unavailable in private or embedded contexts.
  }
}

function shouldForceReplay(): boolean {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get('intro') === 'replay' ||
    params.get('intro') === '1' ||
    params.has('replayIntro') ||
    window.location.hash === '#intro'
  );
}

/**
 * Short cinematic opening: signal scans proof fragments, shows fast reel slices,
 * then lands in the hero.
 */
export function initHomeIntro(deps: HomeIntroDeps): () => void {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const home = document.querySelector<HTMLElement>('[data-home]');
  const signal = document.querySelector<HTMLElement>('[data-signal]');
  const core = document.querySelector<HTMLElement>('[data-intro-core]');
  const fragments = Array.from(document.querySelectorAll<HTMLElement>('[data-intro-fragment]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-intro-panel]'));
  const lock = document.querySelector<HTMLElement>('[data-intro-lock]');
  const skip = document.querySelector<HTMLButtonElement>('[data-intro-skip]');

  if (!intro || !home || !signal || !core || !lock) {
    deps.onComplete();
    return () => undefined;
  }

  const forceReplay = shouldForceReplay();

  if (!forceReplay && hasPlayedThisSession()) {
    intro.remove();
    home.removeAttribute('data-intro-pending');
    deps.onComplete(true);
    return () => undefined;
  }

  if (prefersReducedMotion()) {
    intro.remove();
    home.removeAttribute('data-intro-pending');
    deps.onComplete();
    return () => undefined;
  }

  setScrollLocked(true);
  home.dataset.introPending = 'true';

  let finished = false;
  let tl: gsap.core.Timeline | null = null;

  const finish = (instant = false) => {
    if (finished) return;
    finished = true;
    tl?.kill();
    markPlayedThisSession();
    gsap.killTweensOf([intro, signal, core, lock, skip, ...fragments, ...panels]);

    const rest = heroRestPosition();
    gsap.set(signal, {
      x: rest.x,
      y: rest.y,
      xPercent: -50,
      yPercent: -50,
      zIndex: 2,
      opacity: 1,
      clearProps: 'opacity',
    });
    signal.style.setProperty('--signal-gold', '0.12');
    signal.style.setProperty('--signal-energy', '0.45');

    intro.remove();
    home.removeAttribute('data-intro-pending');
    setScrollLocked(false);
    deps.onComplete(instant);
  };

  const cx = window.innerWidth * 0.5;
  const cy = window.innerHeight * 0.46;

  const runIntro = () => {
    gsap.set(intro, { opacity: 1 });
    gsap.set(core, { opacity: 0, scale: 0.72, rotation: -8 });
    gsap.set(core.querySelectorAll('.intro__ring'), { scale: 0.62, opacity: 0 });
    gsap.set(core.querySelector('.intro__spark'), { scale: 0.2, opacity: 0 });
    gsap.set(fragments, { opacity: 0, x: -28, filter: 'blur(7px)' });
    gsap.set(panels, { opacity: 0, x: 72, scale: 0.96, clipPath: 'inset(0 100% 0 0)' });
    gsap.set(lock, { opacity: 0, y: 18, filter: 'blur(10px)' });
    gsap.set(skip, { opacity: 0 });
    gsap.set(signal, {
      x: cx,
      y: cy,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      opacity: 0,
      zIndex: 9001,
      clearProps: 'opacity',
    });
    signal.style.setProperty('--signal-gold', '0');
    signal.style.setProperty('--signal-energy', '0.12');

    intro.querySelectorAll<HTMLVideoElement>('video').forEach((video) => {
      video.play().catch(() => undefined);
    });

    const flyTarget = heroRestPosition();

    tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(signal, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0.15)
      .to(core, { opacity: 1, scale: 1, rotation: 0, duration: 0.8 }, 0.12)
      .to(core.querySelectorAll('.intro__ring'), { opacity: 1, scale: 1, duration: 0.9, stagger: 0.1 }, 0.18)
      .to(core.querySelector('.intro__spark'), { opacity: 1, scale: 1, duration: 0.4 }, 0.32)
      .to(skip, { opacity: 0.45, duration: 0.35 }, 0.55)
      .to(fragments, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, stagger: 0.12 }, 0.85)
      .to(panels, { opacity: 0.9, x: 0, scale: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.72, stagger: 0.22 }, 1.35)
      .to(panels, { x: -10, scale: 1.025, duration: 1.8, stagger: 0.05, ease: 'none' }, 2.05)
      .to(fragments, { opacity: 0.26, x: 18, duration: 0.5, stagger: 0.035, ease: 'power2.in' }, 3.35)
      .to(panels, { opacity: 0.42, x: -28, clipPath: 'inset(0 0 0 18%)', duration: 0.62, stagger: 0.08, ease: 'power2.inOut' }, 3.55)
      .to(lock, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75 }, 3.95)
      .to(core, { scale: 0.82, opacity: 0.5, duration: 0.7 }, 4.15)
      .to(lock, { opacity: 0, y: -12, filter: 'blur(5px)', duration: 0.45, ease: 'power2.in' }, 5.05)
      .add(() => {
        const t = heroRestPosition();
        flyTarget.x = t.x;
        flyTarget.y = t.y;
      }, 5.2)
      .to(
        signal,
        {
          x: () => flyTarget.x,
          y: () => flyTarget.y,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate: () => {
            const sx = gsap.getProperty(signal, 'x') as number;
            const progress = Math.min(
              1,
              Math.hypot(sx - cx, (gsap.getProperty(signal, 'y') as number) - cy) /
                Math.max(1, Math.hypot(flyTarget.x - cx, flyTarget.y - cy)),
            );
            signal.style.setProperty('--signal-gold', String(progress * 0.12));
            signal.style.setProperty('--signal-energy', String(0.12 + progress * 0.33));
          },
        },
        5.2,
      )
      .to(core, { opacity: 0, scale: 0.55, duration: 0.45, ease: 'power2.in' }, 5.28)
      .to(panels, { opacity: 0, duration: 0.45, ease: 'power2.in' }, 5.45)
      .to(intro, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 6.05)
      .add(finish, 6.65);
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(runIntro);
  } else {
    runIntro();
  }

  const onSkip = () => finish(true);
  skip?.addEventListener('click', onSkip);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      finish(true);
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
