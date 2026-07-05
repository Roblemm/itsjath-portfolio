import gsap from 'gsap';
import { getLenis } from './smooth-scroll';
import { prefersReducedMotion } from './reduced-motion';

export interface HomeIntroDeps {
  onComplete: (instant?: boolean) => void;
}

const SESSION_KEY = 'itsjath-home-intro-played';

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
  if (r && r.width >= 0) return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
  return { x: window.innerWidth * 0.88, y: window.innerHeight * 0.44 };
}

function hasPlayedThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function markPlayedThisSession() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // Session storage can fail in private modes. The intro still works.
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

function formatReach(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')}+`;
}

function setBeatVisibility(beats: HTMLElement[], activeIndex: number) {
  beats.forEach((beat, index) => {
    beat.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
  });
}

function primeVideo(video: HTMLVideoElement) {
  const startAt = Number(video.dataset.introVideoStart ?? '0');
  const setStart = () => {
    if (!Number.isFinite(startAt) || startAt <= 0) return;
    try {
      if (!video.duration || video.duration > startAt) video.currentTime = startAt;
    } catch {
      // Some browsers reject currentTime until the file is ready.
    }
  };

  if (video.readyState >= 1) setStart();
  else video.addEventListener('loadedmetadata', setStart, { once: true });

  video.play().catch(() => undefined);
}

function setSignalToHero(signal: HTMLElement | null) {
  if (!signal) return;
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
}

export function initHomeIntro(deps: HomeIntroDeps): () => void {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const home = document.querySelector<HTMLElement>('[data-home]');
  const signal = document.querySelector<HTMLElement>('[data-signal]');

  if (!intro || !home) {
    deps.onComplete(true);
    return () => undefined;
  }

  if (hasPlayedThisSession() && !shouldForceReplay()) {
    intro.remove();
    home.removeAttribute('data-intro-pending');
    setSignalToHero(signal);
    deps.onComplete(true);
    return () => undefined;
  }

  const duration = Number(intro.dataset.introDuration ?? '22');
  const beats = Array.from(intro.querySelectorAll<HTMLElement>('[data-intro-beat]'));
  const panels = Array.from(intro.querySelectorAll<HTMLElement>('[data-intro-media]'));
  const videos = Array.from(intro.querySelectorAll<HTMLVideoElement>('[data-intro-video]'));
  const count = intro.querySelector<HTMLElement>('[data-intro-count]');
  const skip = intro.querySelector<HTMLButtonElement>('[data-intro-skip]');

  let finished = false;
  let tl: gsap.core.Timeline | null = null;

  const resetVisuals = () => {
    finished = false;
    setBeatVisibility(beats, 0);
    gsap.killTweensOf([intro, ...beats, ...panels, count]);
    gsap.set(intro, { autoAlpha: 1 });
    gsap.set(beats, { autoAlpha: 0, y: 24 });
    gsap.set(beats[0], { autoAlpha: 1, y: 0 });
    gsap.set(panels, { autoAlpha: 0, y: 18, scale: 1.025 });
    if (count) count.textContent = '0';
  };

  const finish = (instant = false) => {
    if (finished) return;
    finished = true;
    markPlayedThisSession();
    tl?.kill();
    videos.forEach((video) => video.pause());
    gsap.killTweensOf([intro, ...beats, ...panels, count]);
    setSignalToHero(signal);
    intro.remove();
    home.removeAttribute('data-intro-pending');
    setScrollLocked(false);
    deps.onComplete(instant);
  };

  const runIntro = () => {
    if (prefersReducedMotion()) {
      finish(true);
      return;
    }

    setScrollLocked(true);
    home.dataset.introPending = 'true';
    resetVisuals();
    videos.forEach(primeVideo);

    const countProxy = { value: 0 };
    tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const beatWindows = [
      { start: 0, end: 2 },
      { start: 2, end: 5.5 },
      { start: 5.5, end: 9.5 },
      { start: 9.5, end: 14 },
      { start: 14, end: 18 },
      { start: 18, end: 22 },
    ];

    beatWindows.forEach((beat, index) => {
      tl?.add(() => setBeatVisibility(beats, index), beat.start);
      tl?.to(beats[index], { autoAlpha: 1, y: 0, duration: index === 0 ? 0.45 : 0.7 }, beat.start + 0.05);
      if (index < beatWindows.length - 1) {
        tl?.to(beats[index], { autoAlpha: 0, y: -18, duration: 0.42, ease: 'power2.in' }, beat.end - 0.48);
      }
    });

    tl.to(panels[0], { autoAlpha: 0.92, y: 0, scale: 1, duration: 1.6 }, 1.8)
      .to(panels[1], { autoAlpha: 0.68, y: 0, scale: 1, duration: 1.2 }, 5.5)
      .to(panels[2], { autoAlpha: 0.58, y: 0, scale: 1, duration: 1.1 }, 7.0)
      .to(panels[3], { autoAlpha: 0.52, y: 0, scale: 1, duration: 1.1 }, 10.0)
      .to(panels[4], { autoAlpha: 0.5, y: 0, scale: 1, duration: 1.1 }, 13.8)
      .to(panels, { autoAlpha: 0.28, y: -8, duration: 1.0, ease: 'power2.out' }, 18);

    panels.forEach((panel, index) => {
      const media = panel.querySelector<HTMLElement>('video, img');
      if (media) tl?.to(media, { scale: 1.1 + index * 0.015, duration: 16 - index, ease: 'none' }, 2 + index * 2);
    });

    if (count) {
      tl.to(
        countProxy,
        {
          value: Number(count.dataset.introCountTo ?? '78000000'),
          duration: 2.65,
          ease: 'power2.out',
          onUpdate: () => {
            count.textContent = formatReach(countProxy.value);
          },
          onComplete: () => {
            count.textContent = '78,000,000+';
          },
        },
        10.15,
      );
    }

    tl.to(intro, { autoAlpha: 0, duration: 0.65, ease: 'power2.inOut' }, duration)
      .add(() => finish(false), duration + 0.7);
  };

  if (document.fonts?.ready) document.fonts.ready.then(runIntro);
  else runIntro();

  const onSkip = () => finish(true);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish(true);
    }
  };

  skip?.addEventListener('click', onSkip);
  window.addEventListener('keydown', onKey);

  return () => {
    skip?.removeEventListener('click', onSkip);
    window.removeEventListener('keydown', onKey);
    setScrollLocked(false);
    tl?.kill();
  };
}
