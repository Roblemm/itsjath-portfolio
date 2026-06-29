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

/**
 * ~6s cinematic opening: signal appears center, greeting resolves, rests on the right.
 */
export function initHomeIntro(deps: HomeIntroDeps): () => void {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const home = document.querySelector<HTMLElement>('[data-home]');
  const signal = document.querySelector<HTMLElement>('[data-signal]');
  const hey = document.querySelector<HTMLElement>('[data-intro-hey]');
  const name = document.querySelector<HTMLElement>('[data-intro-name]');
  const skip = document.querySelector<HTMLButtonElement>('[data-intro-skip]');

  if (!intro || !home || !signal || !hey || !name) {
    deps.onComplete();
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
    gsap.killTweensOf([intro, signal, hey, name, skip]);

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
    gsap.set(hey, { opacity: 0, y: 18 });
    gsap.set(name, { opacity: 0, y: 18 });
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

    const flyTarget = heroRestPosition();

    tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(signal, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.25)
      .to(hey, { opacity: 1, y: 0, duration: 0.85 }, 0.95)
      .to(name, { opacity: 1, y: 0, duration: 0.85 }, 1.8)
      .to(skip, { opacity: 0.45, duration: 0.45 }, 2.1)
      .to([hey, name], { opacity: 0, y: -14, duration: 0.5, ease: 'power2.in' }, 3.4)
      .add(() => {
        const t = heroRestPosition();
        flyTarget.x = t.x;
        flyTarget.y = t.y;
      }, 3.55)
      .to(
        signal,
        {
          x: () => flyTarget.x,
          y: () => flyTarget.y,
          duration: 1.3,
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
        3.55,
      )
      .to(intro, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 5.1)
      .add(finish, 5.85);
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
