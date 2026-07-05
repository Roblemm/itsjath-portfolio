import { describe, expect, it } from 'vitest';
import { createSignalLayoutCache } from './signal-scroll-cache';

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
});
