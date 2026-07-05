import { describe, expect, it } from "vitest";
import { calculateStatGlowValues } from "./signal-scroll-math";

describe("calculateStatGlowValues", () => {
  const base = {
    viewportHeight: 768,
    rowLeft: 40,
    rowRight: 1180,
    signalX: 610,
    count: 3,
  };

  it("keeps the stats dark before the row enters the viewport", () => {
    const glow = calculateStatGlowValues({
      ...base,
      rowTop: 830,
      rowBottom: 1010,
    });

    expect(Math.max(...glow)).toBe(0);
  });

  it("lights the middle stat while the stats row is still visible in frame", () => {
    const glow = calculateStatGlowValues({
      ...base,
      rowTop: 210,
      rowBottom: 390,
    });

    expect(glow[1]).toBeGreaterThanOrEqual(0.45);
    expect(glow[1]).toBeLessThanOrEqual(0.55);
  });

  it("turns glow off after the stats row has scrolled past the viewport", () => {
    const glow = calculateStatGlowValues({
      ...base,
      rowTop: -220,
      rowBottom: -40,
    });

    expect(Math.max(...glow)).toBe(0);
  });

  it("starts the proof glow as the stats section enters the viewport", () => {
    const glow = calculateStatGlowValues({
      ...base,
      rowTop: 690,
      rowBottom: 870,
      signalX: 40,
    });

    expect(Math.max(...glow)).toBeGreaterThan(0);
    expect(Math.max(...glow)).toBeLessThan(0.25);
  });
});
