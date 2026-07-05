import { describe, expect, it } from 'vitest';
import { createSignalLayoutCache, viewportFromDocumentPoint } from './signal-scroll-cache';

describe('createSignalLayoutCache', () => {
  it('reuses measured layout during scroll until invalidated', () => {
    let reads = 0;
    const cache = createSignalLayoutCache(() => {
      reads += 1;
      return { points: [{ x: reads, y: reads }], stats: [] };
    });

    expect(cache.read().points[0]?.x).toBe(1);
    expect(cache.read().points[0]?.x).toBe(1);
    expect(reads).toBe(1);

    cache.invalidate();

    expect(cache.read().points[0]?.x).toBe(2);
    expect(reads).toBe(2);
  });

  it('keeps document-space waypoint measurements until applying the current scroll offset', () => {
    expect(
      viewportFromDocumentPoint(
        { x: 640, y: 3600 },
        { scrollX: 0, scrollY: 3000, width: 1280, height: 800, margin: 16 },
      ),
    ).toEqual({ x: 640, y: 600 });
  });
});
