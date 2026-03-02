import { describe, expect, it } from "vitest";
import { clamp, normalizeAdsr, SYNTH_LIMITS } from "./synthMath";

describe("synthMath", () => {
  it("clamp keeps values inside min/max", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-3, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });

  it("normalizeAdsr merges patch and clamps values", () => {
    const prev = {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2,
    };

    const next = normalizeAdsr(prev, {
      attack: -1,
      sustain: 99,
    });

    expect(next.attack).toBe(SYNTH_LIMITS.attack.min);
    expect(next.decay).toBe(prev.decay);
    expect(next.sustain).toBe(SYNTH_LIMITS.sustain.max);
    expect(next.release).toBe(prev.release);
  });
});
