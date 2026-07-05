export interface SignalLayoutCache<TLayout> {
  read: () => TLayout;
  invalidate: () => void;
}

export interface DocumentPoint {
  x: number;
  y: number;
}

export interface ViewportState {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
  margin?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function viewportFromDocumentPoint(
  point: DocumentPoint,
  viewport: ViewportState,
): DocumentPoint {
  const margin = viewport.margin ?? 16;
  return {
    x: clamp(point.x - viewport.scrollX, margin, viewport.width - margin),
    y: clamp(point.y - viewport.scrollY, margin, viewport.height - margin),
  };
}

export function createSignalLayoutCache<TLayout>(
  readLayout: () => TLayout,
): SignalLayoutCache<TLayout> {
  let cached: TLayout | null = null;

  return {
    read() {
      cached ??= readLayout();
      return cached;
    },
    invalidate() {
      cached = null;
    },
  };
}
