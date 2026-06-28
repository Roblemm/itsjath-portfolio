import gsap from 'gsap';
import { EASE, MOTION } from './constants';
import { prefersReducedMotion, scaleDuration } from './reduced-motion';
import { signal } from './signal';
import { INTRO_SESSION_KEY } from '../../utils/site';

interface IntroElements {
  overlay: HTMLElement;
  skipBtn: HTMLButtonElement;
  heroContent: HTMLElement;
  line1: HTMLElement;
  line2: HTMLElement;
  finalLine: HTMLElement;
  heroDot: HTMLElement;
}

function hasPlayedIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    /* storage unavailable */
  }
}

function revealHero(heroContent: HTMLElement, overlay: HTMLElement) {
  overlay.dataset.complete = 'true';
  heroContent.dataset.ready = 'true';
  gsap.to(overlay, {
    opacity: 0,
    duration: scaleDuration(0.45),
    ease: EASE.cinematic,
    onComplete: () => {
      overlay.style.display = 'none';
    },
  });
  gsap.fromTo(
    heroContent,
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: scaleDuration(0.7), ease: EASE.cinematic },
  );
}

export function initHomeIntro(elements: IntroElements) {
  const { overlay, skipBtn, heroContent, line1, line2, finalLine, heroDot } = elements;
  const signalRoot = document.querySelector<HTMLElement>('[data-signal]');

  if (!signalRoot) {
    heroContent.dataset.ready = 'true';
    overlay.style.display = 'none';
    return () => undefined;
  }

  signal.mount(signalRoot);
  let completed = false;
  let timeline: gsap.core.Timeline | null = null;

  const finish = () => {
    if (completed) return;
    completed = true;
    markIntroPlayed();
    timeline?.kill();
    revealHero(heroContent, overlay);
    signal.moveTo(heroDot, { duration: MOTION.SIGNAL_TRAVEL_S });
    signal.impact({ color: 'gold', strength: 0.7 });
  };

  const runReduced = () => {
    overlay.style.display = 'none';
    heroContent.dataset.ready = 'true';
    gsap.set(heroContent, { opacity: 1 });
    signal.mount(signalRoot);
    signal.appear(heroDot, 0.15);
    signal.setState('gold');
    markIntroPlayed();
  };

  if (prefersReducedMotion()) {
    runReduced();
    return () => signal.destroy();
  }

  if (hasPlayedIntro()) {
    overlay.style.display = 'none';
    heroContent.dataset.ready = 'true';
    gsap.set(heroContent, { opacity: 1 });
    signal.mount(signalRoot);
    signal.appear(heroDot, MOTION.INTRO_REPEAT_S);
    signal.setState('gold');
    return () => signal.destroy();
  }

  gsap.set([line1, line2, finalLine], { opacity: 0, y: 20 });
  gsap.set(finalLine, { display: 'none' });
  signal.appear();

  skipBtn.addEventListener('click', finish);
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') finish();
  };
  window.addEventListener('keydown', onKey);

  timeline = gsap.timeline({
    defaults: { ease: EASE.cinematic },
    onComplete: finish,
  });

  const d = scaleDuration(1);

  timeline
    .to(line1, { opacity: 1, y: 0, duration: d * 0.5 }, 0.4)
    .to(line2, { opacity: 1, y: 0, duration: d * 0.5 }, '+=0.35')
    .to([line1, line2], { opacity: 0, y: -12, duration: d * 0.35 }, '+=0.5')
    .add(() => {
      gsap.set(finalLine, { display: 'block' });
    })
    .fromTo(finalLine, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: d * 0.55 })
    .add(() => signal.impact({ color: 'gold' }), '-=0.2');

  return () => {
    timeline?.kill();
    window.removeEventListener('keydown', onKey);
    skipBtn.removeEventListener('click', finish);
  };
}

export function initPageEntrance(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target || prefersReducedMotion()) {
    if (target) gsap.set(target, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    target,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: scaleDuration(0.65), ease: EASE.cinematic },
  );
}
