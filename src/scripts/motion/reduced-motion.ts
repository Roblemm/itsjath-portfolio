export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getMotionMultiplier(): number {
  return prefersReducedMotion() ? 0.15 : 1;
}

export function scaleDuration(seconds: number): number {
  const multiplier = getMotionMultiplier();
  return Math.max(multiplier < 1 ? 0.12 : seconds * 0.4, seconds * multiplier);
}
