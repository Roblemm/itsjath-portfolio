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

function formatTimecode(seconds: number): string {
  const safeSeconds = Math.max(0, Math.min(99, Math.floor(seconds)));
  const label = safeSeconds < 10 ? `0${safeSeconds}` : String(safeSeconds);
  return `00:${label}`;
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

/**
 * 22s cinematic opening. First visit per session plays the sequence; replay can
 * be forced with ?intro=replay, ?intro=1, ?replayIntro, or #intro.
 */
export function initHomeIntro(deps: HomeIntroDeps): () => void {
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const home = document.querySelector<HTMLElement>('[data-home]');
  const signal = document.querySelector<HTMLElement>('[data-signal]');

  if (!intro || !home) {
    deps.onComplete(true);
    return () => undefined;
  }

  const forceReplay = shouldForceReplay();
  if (hasPlayedThisSession() && !forceReplay) {
    intro.remove();
    home.removeAttribute('data-intro-pending');
    setSignalToHero(signal);
    deps.onComplete(true);
    return () => undefined;
  }

  const duration = Number(intro.dataset.introDuration ?? '22');
  const beats = Array.from(intro.querySelectorAll<HTMLElement>('[data-intro-beat]'));
  const chips = Array.from(intro.querySelectorAll<HTMLElement>('[data-intro-chip]'));
  const panels = Array.from(intro.querySelectorAll<HTMLElement>('[data-intro-media]'));
  const videos = Array.from(intro.querySelectorAll<HTMLVideoElement>('[data-intro-video]'));
  const count = intro.querySelector<HTMLElement>('[data-intro-count]');
  const progress = intro.querySelector<HTMLElement>('[data-intro-progress]');
  const timecode = intro.querySelector<HTMLElement>('[data-intro-timecode]');
  const seq = intro.querySelector<HTMLElement>('[data-intro-seq]');
  const actions = intro.querySelector<HTMLElement>('[data-intro-actions]');
  const enter = intro.querySelector<HTMLButtonElement>('[data-intro-enter]');
  const replay = intro.querySelector<HTMLButtonElement>('[data-intro-replay]');
  const skip = intro.querySelector<HTMLButtonElement>('[data-intro-skip]');

  let finished = false;
  let tl: gsap.core.Timeline | null = null;

  const setHud = (seconds: number) => {
    if (timecode) timecode.textContent = formatTimecode(seconds);
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, (seconds / duration) * 100))}%`;

    const activeBeat = beats.reduce((active, beat, index) => {
      const start = Number(beat.dataset.introBeatStart ?? index);
      return seconds >= start ? index : active;
    }, 0);
    if (seq) {
      const id = beats[activeBeat]?.dataset.introBeatId ?? 'intro';
      seq.textContent = `SEQ ${id.toUpperCase()}`;
    }
  };

  const showActions = () => {
    if (!actions) return;
    actions.dataset.ready = 'true';
    gsap.to(actions, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' });
    window.setTimeout(() => enter?.focus({ preventScroll: true }), 80);
  };

  const resetVisuals = () => {
    finished = false;
    actions?.removeAttribute('data-ready');
    chips.forEach((chip) => chip.removeAttribute('data-chip-active'));
    setBeatVisibility(beats, 0);

    gsap.killTweensOf([intro, ...beats, ...chips, ...panels, actions, progress, count]);
    gsap.set(intro, { autoAlpha: 1 });
    gsap.set(beats, { autoAlpha: 0, y: 24 });
    gsap.set(beats[0], { autoAlpha: 1, y: 0 });
    gsap.set(chips, { autoAlpha: 0, x: -14, y: 0 });
    gsap.set(panels, { autoAlpha: 0, y: 18, scale: 1.025 });
    gsap.set(actions, { autoAlpha: 0 });
    if (count) count.textContent = '0';
    setHud(0);
  };

  const finish = (instant = false) => {
    if (finished) return;
    finished = true;
    markPlayedThisSession();
    tl?.kill();
    videos.forEach((video) => video.pause());
    gsap.killTweensOf([intro, ...beats, ...chips, ...panels, actions, progress, count]);
    setSignalToHero(signal);
    intro.remove();
    home.removeAttribute('data-intro-pending');
    setScrollLocked(false);
    deps.onComplete(instant);
  };

  const showReducedMotionFinal = () => {
    setScrollLocked(true);
    home.dataset.introPending = 'true';
    resetVisuals();
    const finalIndex = Math.max(0, beats.length - 1);
    setBeatVisibility(beats, finalIndex);
    gsap.set(beats, { autoAlpha: 0, y: 0 });
    gsap.set(beats[finalIndex], { autoAlpha: 1, y: 0 });
    gsap.set(chips, { autoAlpha: 0 });
    gsap.set(panels, { autoAlpha: 0 });
    if (count) count.textContent = '78,000,000+';
    setHud(duration);
    showActions();
  };

  const runIntro = () => {
    setScrollLocked(true);
    home.dataset.introPending = 'true';
    resetVisuals();
    videos.forEach(primeVideo);

    const countProxy = { value: 0 };
    tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onUpdate: () => setHud(tl?.time() ?? 0),
    });

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

    tl.to(panels[0], { autoAlpha: 0.78, y: 0, scale: 1, duration: 2.2 }, 2.1)
      .to(panels[1], { autoAlpha: 0.48, y: 0, scale: 1, duration: 1.4 }, 5.8)
      .to(panels[2], { autoAlpha: 0.4, y: 0, scale: 1, duration: 1.2 }, 7.3)
      .to(panels[3], { autoAlpha: 0.36, y: 0, scale: 1, duration: 1.2 }, 10.3)
      .to(panels[4], { autoAlpha: 0.34, y: 0, scale: 1, duration: 1.2 }, 14.2)
      .to(panels, { autoAlpha: 0.16, y: -8, duration: 1.1, ease: 'power2.out' }, 18);

    panels.forEach((panel, index) => {
      const media = panel.querySelector<HTMLElement>('video, img');
      if (media) {
        tl?.to(media, { scale: 1.1 + index * 0.015, duration: 16 - index, ease: 'none' }, 2 + index * 2);
      }
    });

    [2.6, 6.1, 8.2, 9.8, 14.4].forEach((time, index) => {
      tl?.to(chips[index], { autoAlpha: 1, x: 0, duration: 0.45 }, time);
    });

    tl.add(() => chips[3]?.setAttribute('data-chip-active', 'true'), 9.6)
      .add(() => chips[3]?.removeAttribute('data-chip-active'), 14)
      .to(chips, { autoAlpha: 0, y: 12, duration: 0.55, ease: 'power2.inOut' }, 18);

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

    tl.add(showActions, 21.2).to({}, { duration: duration }, 0);
  };

  if (prefersReducedMotion()) {
    showReducedMotionFinal();
  } else if (document.fonts?.ready) {
    document.fonts.ready.then(runIntro);
  } else {
    runIntro();
  }

  const onSkip = () => finish(true);
  const onEnter = () => finish(false);
  const onReplay = () => {
    tl?.kill();
    if (prefersReducedMotion()) showReducedMotionFinal();
    else runIntro();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish(true);
    }
  };

  skip?.addEventListener('click', onSkip);
  enter?.addEventListener('click', onEnter);
  replay?.addEventListener('click', onReplay);
  window.addEventListener('keydown', onKey);

  return () => {
    skip?.removeEventListener('click', onSkip);
    enter?.removeEventListener('click', onEnter);
    replay?.removeEventListener('click', onReplay);
    window.removeEventListener('keydown', onKey);
    setScrollLocked(false);
    tl?.kill();
  };
}
