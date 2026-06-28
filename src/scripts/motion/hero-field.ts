import { prefersReducedMotion } from './reduced-motion';

/**
 * Cinematic flow-field particle wave.
 *
 * A bright gold ribbon sweeps across the canvas, dispersing into a haze of
 * purple particles toward the edges. Rendered on a single canvas with additive
 * blending and pre-rendered glow sprites for performance.
 */

interface Particle {
  /** position along the flow, 0..1, wraps */
  t: number;
  /** vertical offset from the ribbon centerline, in normalized units */
  offset: number;
  /** horizontal travel speed */
  speed: number;
  /** sprite radius in px */
  size: number;
  /** per-particle phase so the wave isn't uniform */
  phase: number;
  /** base brightness multiplier */
  glow: number;
}

const GOLD = { r: 255, g: 200, b: 90 };
const PURPLE = { r: 150, g: 90, b: 255 };

function makeSprite(color: { r: number; g: number; b: number }, radius: number): HTMLCanvasElement {
  const size = radius * 2;
  const sprite = document.createElement('canvas');
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext('2d');
  if (!ctx) return sprite;
  const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  const { r, g, b } = color;
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.25, `rgba(${r},${g},${b},0.55)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

export interface HeroField {
  destroy: () => void;
  /** Drive the field with overall page scroll progress, 0..1. */
  setScroll: (progress: number) => void;
}

export function initHeroField(canvas: HTMLCanvasElement): HeroField {
  const maybeCtx = canvas.getContext('2d', { alpha: true });
  if (!maybeCtx) return { destroy: () => undefined, setScroll: () => undefined };
  const ctx: CanvasRenderingContext2D = maybeCtx;

  const SPRITE_RADIUS = 64;
  const goldSprite = makeSprite(GOLD, SPRITE_RADIUS);
  const purpleSprite = makeSprite(PURPLE, SPRITE_RADIUS);

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles: Particle[] = [];
  let raf = 0;
  let running = true;
  let time = 0;

  // Pointer parallax — the ribbon leans toward the cursor a touch.
  let pointerX = 0.5;
  let pointerY = 0.5;
  let targetPointerX = 0.5;
  let targetPointerY = 0.5;

  // Scroll progress drives the cinematic transformation across scenes.
  let scroll = 0;
  let targetScroll = 0;

  function rand(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  // Gaussian-ish offset so particles cluster near the ribbon center.
  function gaussianOffset(): number {
    const u = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    return u * 2;
  }

  function buildParticles() {
    const area = width * height;
    const count = Math.round(Math.min(620, Math.max(160, area / 3400)));
    particles = new Array(count).fill(null).map(() => ({
      t: Math.random(),
      offset: gaussianOffset(),
      speed: rand(0.018, 0.06) / 1000,
      size: rand(0.6, 2.4),
      phase: rand(0, Math.PI * 2),
      glow: rand(0.35, 1),
    }));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  /**
   * The ribbon centerline. Layered sine waves create an organic, flowing curve
   * that tilts gently across the canvas and breathes over time.
   */
  function centerlineY(xNorm: number, t: number): number {
    const tilt = (xNorm - 0.5) * 0.22; // gentle diagonal lean
    const w1 = Math.sin(xNorm * 4.1 + t * 0.45) * 0.12;
    const w2 = Math.sin(xNorm * 9.3 - t * 0.7 + 1.3) * 0.05;
    const lean = (pointerY - 0.5) * 0.06;
    // The whole ribbon rises and exits the frame as the page scrolls.
    const drift = scroll * 0.5;
    return 0.55 + tilt + w1 + w2 + lean - drift;
  }

  /** Overall brightness of the field — vivid in the hero, calm deeper down. */
  function vividness(): number {
    return Math.max(0.1, 1 - scroll * 1.5);
  }

  /** Focal point slides left as you scroll, like a camera pan. */
  function focalX(): number {
    return 0.62 + (pointerX - 0.5) * 0.08 - scroll * 0.18;
  }

  /** Vertical thickness of the ribbon, narrowing toward the bright focal point. */
  function ribbonSpread(xNorm: number): number {
    const d = Math.abs(xNorm - focalX());
    // tight near focal, flaring toward the edges
    return 0.04 + Math.pow(d, 1.35) * 0.42;
  }

  /** Brightness envelope — peaks at the focal point, fades at the edges. */
  function focusEnvelope(xNorm: number): number {
    const d = Math.abs(xNorm - focalX());
    return Math.max(0, 1 - Math.pow(d * 1.55, 1.6));
  }

  /** A glowing continuous ribbon traced along the flow centerline. */
  function drawRibbon() {
    const samples = 64;
    const focal = focalX();
    const v = vividness();

    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, 'rgba(150,90,255,0)');
    grad.addColorStop(0.28, 'rgba(180,120,255,0.25)');
    grad.addColorStop(Math.min(0.95, focal - 0.04), 'rgba(255,180,80,0.55)');
    grad.addColorStop(Math.min(0.98, focal + 0.02), 'rgba(255,225,150,0.95)');
    grad.addColorStop(1, 'rgba(255,200,90,0)');

    const trace = () => {
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const xN = i / samples;
        const x = xN * width;
        const y = centerlineY(xN, time) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    };

    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';

    // Soft outer glow
    ctx.shadowColor = 'rgba(255,190,90,0.55)';
    ctx.shadowBlur = 38;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.5 * v;
    trace();
    ctx.stroke();

    // Bright hot core
    ctx.shadowBlur = 14;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.9 * v;
    trace();
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  function frame() {
    if (!running) return;
    time += 0.016;
    pointerX += (targetPointerX - pointerX) * 0.04;
    pointerY += (targetPointerY - pointerY) * 0.04;
    scroll += (targetScroll - scroll) * 0.08;

    const v = vividness();
    // Gold gives way to purple as the camera moves deeper into the page.
    const goldScale = Math.max(0, 1 - scroll * 0.85);

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Ambient purple bloom in the upper field
    const fxBloom = focalX() * width;
    const bloomY = centerlineY(0.62, time) * height - height * 0.18;
    ctx.globalAlpha = 0.4 * (0.5 + v * 0.5);
    ctx.drawImage(purpleSprite, fxBloom - 260, bloomY - 220, 560, 440);

    for (const p of particles) {
      p.t += p.speed;
      if (p.t > 1.08) p.t -= 1.16;

      const xNorm = p.t;
      const spread = ribbonSpread(xNorm);
      const yNorm = centerlineY(xNorm, time) + p.offset * spread;

      const x = xNorm * width;
      const y = yNorm * height + Math.sin(time * 1.3 + p.phase) * 4;

      if (y < -40 || y > height + 40) continue;

      const env = focusEnvelope(xNorm);
      // Particles near the centerline read as the hot gold core.
      const core = Math.max(0, 1 - Math.abs(p.offset) * 1.15);
      const goldMix = Math.min(1, core * env * 1.4) * goldScale;
      const alpha = Math.min(0.9, (0.05 + env * 0.55) * p.glow * (0.5 + core * 0.8)) * v;

      if (alpha < 0.012) continue;

      const r = p.size * (1 + env * 2.2);
      const drawR = Math.max(1.5, r * 6);
      const d = drawR;

      if (goldMix > 0.02) {
        ctx.globalAlpha = alpha * goldMix;
        ctx.drawImage(goldSprite, x - d / 2, y - d / 2, d, d);
      }
      const purpleA = alpha * (1 - goldMix * 0.6);
      if (purpleA > 0.012) {
        ctx.globalAlpha = purpleA;
        ctx.drawImage(purpleSprite, x - d / 2, y - d / 2, d, d);
      }
    }

    // The flowing gold ribbon + a concentrated hot bloom at the focal point.
    drawRibbon();

    const fx = focalX() * width;
    const fy = centerlineY(focalX(), time) * height;
    ctx.globalAlpha = 0.6 * v * goldScale;
    ctx.drawImage(goldSprite, fx - 150, fy - 90, 300, 180);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function renderStatic() {
    // One representative frame for reduced-motion users.
    time = 2.2;
    pointerX = 0.5;
    pointerY = 0.5;
    running = false;
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      const xNorm = p.t;
      const spread = ribbonSpread(xNorm);
      const yNorm = centerlineY(xNorm, time) + p.offset * spread;
      const x = xNorm * width;
      const y = yNorm * height;
      const env = focusEnvelope(xNorm);
      const core = Math.max(0, 1 - Math.abs(p.offset) * 1.15);
      const goldMix = Math.min(1, core * env * 1.4);
      const alpha = Math.min(0.85, (0.05 + env * 0.5) * p.glow * (0.5 + core * 0.8));
      const drawR = Math.max(1.5, p.size * (1 + env * 2.2) * 6);
      ctx.globalAlpha = alpha * goldMix;
      ctx.drawImage(goldSprite, x - drawR / 2, y - drawR / 2, drawR, drawR);
      ctx.globalAlpha = alpha * (1 - goldMix * 0.6);
      ctx.drawImage(purpleSprite, x - drawR / 2, y - drawR / 2, drawR, drawR);
    }
    drawRibbon();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  const onResize = () => {
    resize();
    if (prefersReducedMotion()) renderStatic();
  };

  const onPointerMove = (e: PointerEvent) => {
    targetPointerX = e.clientX / window.innerWidth;
    targetPointerY = e.clientY / window.innerHeight;
  };

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!prefersReducedMotion()) {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }
  };

  resize();
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  if (prefersReducedMotion()) {
    renderStatic();
  } else {
    window.addEventListener('pointermove', onPointerMove);
    raf = requestAnimationFrame(frame);
  }

  return {
    setScroll(progress: number) {
      targetScroll = Math.max(0, Math.min(1, progress));
      if (prefersReducedMotion()) {
        scroll = targetScroll;
        renderStatic();
      }
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
