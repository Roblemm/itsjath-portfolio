import { describe, expect, it } from 'vitest';
import { scaleDuration } from './reduced-motion';

describe('scaleDuration', () => {
  it('returns full duration when multiplier is 1', () => {
    expect(scaleDuration(1)).toBeGreaterThan(0);
  });
});
