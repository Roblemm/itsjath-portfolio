import { describe, expect, it } from 'vitest';
import { createStartupGate } from './startup-gate';

describe('createStartupGate', () => {
  it('allows one boot per page lifecycle and ignores duplicate startup events', () => {
    const gate = createStartupGate();

    expect(gate.claim()).toBe(true);
    expect(gate.claim()).toBe(false);
    expect(gate.claim()).toBe(false);

    gate.reset();

    expect(gate.claim()).toBe(true);
    expect(gate.claim()).toBe(false);
  });
});
