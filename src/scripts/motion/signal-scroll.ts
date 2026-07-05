import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createSignalLayoutCache } from './signal-scroll-cache';
import { calculateStatGlowValues } from './signal-scroll-math';
import { prefersReducedMotion } from './reduced-motion';

gsap.registerPlugin(ScrollTrigger);

interface WaypointConfig {
  el: HTMLElement;
  energy: number;
  gold: number;
  chapter: string;
}

interface DocumentPoint {
  x: number;
  y: number;
  energy: number;
  gold: number;
  chapter: string;
}

interface StatLayout {
  sorted: HTMLElement[];
  rowTop: number;
  rowBottom: number;
  rowLeft: number;
  rowRight: number;
  count: number;
}

interface SignalLayout {
  points: DocumentPoint[];
  stats: StatLayout | null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clampViewport(x: number, y: number, margin = 16) {
  return {
    x: Math.min(window.innerWidth - margin, Math.max(margin, x)),
    y: Math.min(window.innerHeight - margin, Math.max(margin, y)),
  };
}

function readWaypointPosition(el: HTMLElement): { x: number; y: number } {
  const targetSel = el.dataset.target;
  const anchor = el.dataset.anchor ?? 'center';

  if (targetSel) {
    const tgt = document.querySelector<HTMLElement>(targetSel);
    if (tgt) {
      const r = tgt.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        const x = r.left + r.width * 0.5;
        const y =
          anchor === 'baseline'
            ? r.top + r.height * 0.82
            : r.top + r.height * 0.5;
        return clampViewport(x, y);
      }
    }
  }

  const rect = el.getBoundingClientRect();
  return clampViewport(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function readWaypointDocumentPosition(el: HTMLElement): { x: number; y: number } {
  const { x, y } = readWaypointPosition(el);
  return {
    x: x + window.scrollX,
    y: y + window.scrollY,
  };
}

function readPoint(el: HTMLElement, energy: number, gold: number, chapter: string): DocumentPoint {
  const { x, y } = readWaypointDocumentPosition(el);
  return { x, y, energy, gold, chapter };
}

function resolveEnergy(el: HTMLElement, fallback: number): number {
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  if (mobile && el.dataset.energyMobile) {
    return Number(el.dataset.energyMobile);
  }
  return fallback;
}

function sortStatValues(statValues: HTMLElement[]): HTMLElement[] {
  return [...statValues].sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    if (Math.abs(ra.top - rb.top) > 24) return ra.top - rb.top;
    return ra.left - rb.left;
  });
}

function updateStatGlow(
  statLayout: StatLayout | null,
  signalX: number,
  _signalY: number,
  chapter: string,
) {
  if (!statLayout) return;

  const reset = () => {
    statLayout.sorted.forEach((el) => {
      const stat = el.closest('.stat') as HTMLElement | null;
      el.style.setProperty('--stat-glow', '0');
      el.classList.remove('is-lit');
      stat?.classList.remove('is-lit');
      stat?.style.setProperty('--stat-glow', '0');
    });
  };

  const glows = calculateStatGlowValues({
    viewportHeight: window.innerHeight,
    rowTop: statLayout.rowTop - window.scrollY,
    rowBottom: statLayout.rowBottom - window.scrollY,
    rowLeft: statLayout.rowLeft - window.scrollX,
    rowRight: statLayout.rowRight - window.scrollX,
    signalX,
    count: statLayout.count,
  });

  if (chapter !== 'proof' && Math.max(...glows) <= 0) {
    reset();
    return;
  }

  statLayout.sorted.forEach((el, i) => {
    const glow = glows[i] ?? 0;
    const lit = glow > 0.025;

    el.style.setProperty('--stat-glow', String(glow));
    el.classList.toggle('is-lit', lit);
    const stat = el.closest('.stat') as HTMLElement | null;
    stat?.style.setProperty('--stat-glow', String(glow));
    stat?.classList.toggle('is-lit', lit);
  });
}

function updateCtaGlow(
  chapter: string,
  segmentT: number,
  gold: number,
  scrollProgress: number,
  signalY: number,
) {
  const cta = document.querySelector<HTMLElement>('[data-cta]');
  if (!cta) return;

  let intensity = 0;

  if (chapter === 'connect') {
    intensity = 0.45 + segmentT * 0.55;
  } else if (chapter === 'toolkit' && segmentT > 0.5) {
    intensity = ((segmentT - 0.5) / 0.5) * 0.4;
  }

  const scrollRamp = Math.min(1, Math.max(0, (scrollProgress - 0.8) / 0.2));
  intensity = Math.max(intensity, scrollRamp * 0.9);

  const vh = window.innerHeight;
  if (scrollProgress > 0.72 && signalY > vh * 0.58) {
    const yRamp = (signalY - vh * 0.5) / (vh * 0.38);
    intensity = Math.max(intensity, Math.min(1, yRamp));
  }

  intensity = Math.min(0.1, intensity * (0.075 + gold * 0.025));
  cta.style.setProperty('--cta-glow', String(intensity));
  document.body.style.setProperty('--cta-glow-opacity', String(intensity));
  document.body.toggleAttribute('data-cta-glow', intensity > 0.01);
}

function updateHeroDot(gold: number) {
  const dot = document.querySelector<HTMLElement>('[data-signal-dot]');
  if (!dot || gold < 0.55) return;
  dot.style.setProperty('--dot-gold', String(Math.min(1, (gold - 0.55) * 2.2)));
}

export function initSignalScroll(
  options: { initialProgress?: number } = {},
): () => void {
  const signal = document.querySelector<HTMLElement>('[data-signal]');
  const home = document.querySelector<HTMLElement>('[data-home]');
  if (!signal || !home) return () => undefined;

  const waypointEls = Array.from(
    home.querySelectorAll<HTMLElement>('[data-signal-waypoint]'),
  );

  if (waypointEls.length < 2) return () => undefined;

  const configs: WaypointConfig[] = waypointEls.map((el) => ({
    el,
    energy: Number(el.dataset.energy ?? '0.5'),
    gold: Number(el.dataset.gold ?? '0'),
    chapter: el.dataset.chapter ?? 'hero',
  }));

  const statValues = Array.from(
    home.querySelectorAll<HTMLElement>('[data-stats] [data-count]'),
  );

  const readLayout = (): SignalLayout => {
    const section = document.querySelector<HTMLElement>('[data-stats]');
    const row = section?.querySelector<HTMLElement>('.stats-grid') ?? section;
    const sorted = statValues.length > 0 ? sortStatValues(statValues) : [];
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const rowRect = row?.getBoundingClientRect();
    const firstRect = first?.getBoundingClientRect();
    const lastRect = last?.getBoundingClientRect();

    return {
      points: configs.map((c) =>
        readPoint(c.el, resolveEnergy(c.el, c.energy), c.gold, c.chapter),
      ),
      stats:
        rowRect && firstRect && lastRect
          ? {
              sorted,
              rowTop: rowRect.top + window.scrollY,
              rowBottom: rowRect.bottom + window.scrollY,
              rowLeft: firstRect.left + window.scrollX,
              rowRight: lastRect.right + window.scrollX,
              count: sorted.length,
            }
          : null,
    };
  };

  const layoutCache = createSignalLayoutCache(readLayout);

  const apply = (progress: number) => {
    const layout = layoutCache.read();
    const points = layout.points.map((point) => ({
      ...point,
      x: point.x - window.scrollX,
      y: point.y - window.scrollY,
    }));
    const segments = points.length - 1;
    const scaled = Math.min(Math.max(progress, 0), 1) * segments;
    const index = Math.min(Math.floor(scaled), segments - 1);
    const t = scaled - index;
    const a = points[index];
    const b = points[index + 1];

    const x = lerp(a.x, b.x, t);
    const y = lerp(a.y, b.y, t);
    const clamped = clampViewport(x, y);

    gsap.set(signal, {
      x: clamped.x,
      y: clamped.y,
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      force3D: true,
    });

    const gold = lerp(a.gold, b.gold, t);
    const energy = lerp(a.energy, b.energy, t);
    const chapter = t < 0.5 ? a.chapter : b.chapter;

    signal.style.setProperty('--signal-gold', String(gold));
    signal.style.setProperty('--signal-energy', String(energy));
    signal.dataset.chapter = chapter;

    updateHeroDot(gold);
    updateStatGlow(layout.stats, clamped.x, clamped.y, chapter);
    updateCtaGlow(chapter, t, gold, progress, clamped.y);
  };

  const start = () => {
    apply(options.initialProgress ?? 0);
  };

  if (prefersReducedMotion()) {
    start();
    statValues.forEach((el) => {
      el.style.setProperty('--stat-glow', '1');
      el.classList.add('is-lit');
      const stat = el.closest('.stat') as HTMLElement | null;
      stat?.style.setProperty('--stat-glow', '1');
      stat?.classList.add('is-lit');
    });
    const glow = document.querySelector<HTMLElement>('[data-cta]');
    glow?.style.setProperty('--cta-glow', '1');
    document.body.style.setProperty('--cta-glow-opacity', '1');
    document.body.setAttribute('data-cta-glow', '');
    return () => undefined;
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      layoutCache.invalidate();
      start();
    });
  } else {
    start();
  }

  const st = ScrollTrigger.create({
    trigger: home,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.45,
    onRefresh: () => layoutCache.invalidate(),
    onUpdate: (self) => apply(self.progress),
  });

  const onResize = () => {
    layoutCache.invalidate();
    ScrollTrigger.refresh();
    apply(st.progress);
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    st.kill();
  };
}
