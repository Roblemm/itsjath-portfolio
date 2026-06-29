export interface StatGlowInput {
  viewportHeight: number;
  rowTop: number;
  rowBottom: number;
  rowLeft: number;
  rowRight: number;
  signalX: number;
  count: number;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function calculateStatGlowValues(input: StatGlowInput): number[] {
  const {
    viewportHeight,
    rowTop,
    rowBottom,
    rowLeft,
    rowRight,
    signalX,
    count,
  } = input;

  if (count <= 0) return [];

  const rowProgress = smoothstep(viewportHeight * 0.42, viewportHeight * 0.13, rowTop);
  const exitGate = smoothstep(0, viewportHeight * 0.14, rowBottom);
  if (rowProgress <= 0 || exitGate <= 0) {
    return Array.from({ length: count }, () => 0);
  }

  const span = Math.max(rowRight - rowLeft, 1);
  const rowT = clamp01((signalX - rowLeft) / span);
  const thresholds =
    count === 3
      ? [0.14, 0.36, 0.58]
      : Array.from({ length: count }, (_, i) => 0.14 + i * (0.44 / Math.max(count - 1, 1)));
  const glowMax = 0.55;

  return thresholds.map((threshold) => {
    const scrollPassed = smoothstep(threshold, threshold + 0.16, rowProgress);
    const signalPassed = smoothstep(threshold, threshold + 0.22, rowT) * rowProgress;
    const passed = Math.max(scrollPassed, signalPassed);
    return Math.min(glowMax, passed * exitGate * glowMax);
  });
}
