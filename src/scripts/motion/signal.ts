import gsap from 'gsap';
import { EASE, MOTION } from './constants';
import { scaleDuration } from './reduced-motion';

export type SignalState =
  | 'dormant'
  | 'forming'
  | 'purple'
  | 'traveling'
  | 'impact'
  | 'gold'
  | 'orbit'
  | 'connecting'
  | 'soft'
  | 'hidden';

interface MoveOptions {
  duration?: number;
  ease?: string;
}

class SignalController {
  private root: HTMLElement | null = null;
  private core: HTMLElement | null = null;
  private ring: HTMLElement | null = null;
  private state: SignalState = 'dormant';
  private tweens: gsap.core.Tween[] = [];

  mount(root: HTMLElement) {
    this.root = root;
    this.core = root.querySelector<HTMLElement>('[data-signal-core]');
    this.ring = root.querySelector<HTMLElement>('[data-signal-ring]');
    this.setState('purple');
  }

  setState(next: SignalState) {
    this.state = next;
    this.root?.setAttribute('data-state', next);
  }

  getState(): SignalState {
    return this.state;
  }

  private killTweens() {
    this.tweens.forEach((tween) => tween.kill());
    this.tweens = [];
  }

  appear(target?: HTMLElement, duration = MOTION.SIGNAL_IMPACT_S) {
    if (!this.root) return;
    const d = scaleDuration(duration);
    this.killTweens();
    this.setState('forming');

    if (target) {
      const rect = target.getBoundingClientRect();
      gsap.set(this.root, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        xPercent: -50,
        yPercent: -50,
      });
    } else {
      gsap.set(this.root, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        xPercent: -50,
        yPercent: -50,
      });
    }

    this.tweens.push(
      gsap.fromTo(
        this.core,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: d,
          ease: EASE.impact,
          onComplete: () => this.setState('purple'),
        },
      ),
    );
    this.ring?.classList.add('signal-ring--active');
  }

  moveTo(target: HTMLElement, options: MoveOptions = {}) {
    if (!this.root) return;
    const duration = scaleDuration(options.duration ?? MOTION.SIGNAL_TRAVEL_S);
    this.setState('traveling');
    const rect = target.getBoundingClientRect();

    this.tweens.push(
      gsap.to(this.root, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        duration,
        ease: options.ease ?? EASE.cinematic,
        onComplete: () => this.setState('purple'),
      }),
    );
  }

  impact(options: { color?: 'gold' | 'purple'; strength?: number } = {}) {
    if (!this.core) return;
    const strength = options.strength ?? 0.8;
    const d = scaleDuration(MOTION.SIGNAL_IMPACT_S);
    this.setState('impact');

    if (options.color === 'gold') {
      this.setState('gold');
    }

    this.tweens.push(
      gsap.fromTo(
        this.core,
        { scale: 1 },
        {
          scale: 1 + strength * 0.6,
          duration: d * 0.45,
          ease: EASE.impact,
          yoyo: true,
          repeat: 1,
          onComplete: () => this.setState(options.color === 'gold' ? 'gold' : 'purple'),
        },
      ),
    );
  }

  reset() {
    this.killTweens();
    this.setState('purple');
    this.ring?.classList.remove('signal-ring--active');
    if (this.core) gsap.set(this.core, { scale: 1, opacity: 1 });
  }

  hide() {
    this.setState('hidden');
    if (this.core) {
      this.tweens.push(gsap.to(this.core, { opacity: 0, duration: scaleDuration(0.2) }));
    }
  }

  show() {
    this.setState('purple');
    if (this.core) {
      this.tweens.push(gsap.to(this.core, { opacity: 1, duration: scaleDuration(0.2) }));
    }
  }

  destroy() {
    this.killTweens();
    this.root = null;
    this.core = null;
    this.ring = null;
  }
}

export const signal = new SignalController();
