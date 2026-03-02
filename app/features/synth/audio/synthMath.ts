import type { AdsrSettings } from "../types";

export const SYNTH_LIMITS = {
  frequency: { min: 20, max: 20000 },
  volume: { min: 0, max: 1 },
  cutoff: { min: 60, max: 12000 },
  attack: { min: 0.01, max: 2 },
  decay: { min: 0.01, max: 2 },
  sustain: { min: 0, max: 1 },
  release: { min: 0.01, max: 3 },
} as const;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeAdsr(
  prev: AdsrSettings,
  patch: Partial<AdsrSettings>,
): AdsrSettings {
  return {
    attack: clamp(
      patch.attack ?? prev.attack,
      SYNTH_LIMITS.attack.min,
      SYNTH_LIMITS.attack.max,
    ),
    decay: clamp(
      patch.decay ?? prev.decay,
      SYNTH_LIMITS.decay.min,
      SYNTH_LIMITS.decay.max,
    ),
    sustain: clamp(
      patch.sustain ?? prev.sustain,
      SYNTH_LIMITS.sustain.min,
      SYNTH_LIMITS.sustain.max,
    ),
    release: clamp(
      patch.release ?? prev.release,
      SYNTH_LIMITS.release.min,
      SYNTH_LIMITS.release.max,
    ),
  };
}
