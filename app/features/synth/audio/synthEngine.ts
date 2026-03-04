import type { AdsrSettings } from "../types";
import { clamp, normalizeAdsr, SYNTH_LIMITS } from "./synthMath";

let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let oscillator2: OscillatorNode | null = null;
let oscillator2GainNode: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let envelopeGainNode: GainNode | null = null;
let masterGainNode: GainNode | null = null;
let isPlaying = false;
let proEnabled = false;

let currentFrequency = 330;
let currentWaveform: OscillatorType = "sine";
let currentVolume = 0.2;
let currentCutoff = 1200;
let currentAdsr: AdsrSettings = {
  attack: 0.05,
  decay: 0.2,
  sustain: 0.7,
  release: 0.3,
};

const PRO_OSC_SEMITONES = 7;
const PRO_OSC_GAIN = 0.35;

function semitonesToRatio(semitones: number) {
  return Math.pow(2, semitones / 12);
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function applyEnvelopeAttack(now: number) {
  if (!envelopeGainNode) return;
  envelopeGainNode.gain.cancelScheduledValues(now);
  envelopeGainNode.gain.setValueAtTime(0, now);
  envelopeGainNode.gain.linearRampToValueAtTime(1, now + currentAdsr.attack);
  envelopeGainNode.gain.linearRampToValueAtTime(
    currentAdsr.sustain,
    now + currentAdsr.attack + currentAdsr.decay,
  );
}

function applyEnvelopeRelease(now: number) {
  if (!envelopeGainNode) return;
  const currentValue = envelopeGainNode.gain.value;
  envelopeGainNode.gain.cancelScheduledValues(now);
  envelopeGainNode.gain.setValueAtTime(currentValue, now);
  envelopeGainNode.gain.linearRampToValueAtTime(0, now + currentAdsr.release);
}

function wireAndConfigureNodes(ctx: AudioContext) {
  oscillator = ctx.createOscillator();
  filterNode = ctx.createBiquadFilter();
  envelopeGainNode = ctx.createGain();
  masterGainNode = ctx.createGain();

  oscillator.connect(filterNode);
  filterNode.connect(envelopeGainNode);
  envelopeGainNode.connect(masterGainNode);
  masterGainNode.connect(ctx.destination);

  oscillator.type = currentWaveform;
  oscillator.frequency.value = currentFrequency;

  if (proEnabled) {
    oscillator2 = ctx.createOscillator();
    oscillator2GainNode = ctx.createGain();
    oscillator2.type = currentWaveform;
    oscillator2.frequency.value =
      currentFrequency * semitonesToRatio(PRO_OSC_SEMITONES);
    oscillator2GainNode.gain.value = PRO_OSC_GAIN;
    oscillator2.connect(oscillator2GainNode);
    oscillator2GainNode.connect(filterNode);
  } else {
    oscillator2 = null;
    oscillator2GainNode = null;
  }

  filterNode.type = "lowpass";
  filterNode.frequency.value = currentCutoff;
  envelopeGainNode.gain.value = 0;
  masterGainNode.gain.value = currentVolume;
}

function stopAndDisconnectImmediately() {
  if (!oscillator) return;

  const osc = oscillator;
  const osc2 = oscillator2;
  const osc2Gain = oscillator2GainNode;
  const filter = filterNode;
  const envGain = envelopeGainNode;
  const masterGain = masterGainNode;

  try {
    osc.stop();
  } catch {
    // Oscillator may already be stopped.
  }
  if (osc2) {
    try {
      osc2.stop();
    } catch {
      // Oscillator may already be stopped.
    }
  }
  osc.disconnect();
  osc2?.disconnect();
  osc2Gain?.disconnect();
  filter?.disconnect();
  envGain?.disconnect();
  masterGain?.disconnect();

  oscillator = null;
  oscillator2 = null;
  oscillator2GainNode = null;
  filterNode = null;
  envelopeGainNode = null;
  masterGainNode = null;
  isPlaying = false;
}

export function noteOn(freq: number) {
  currentFrequency = clamp(
    freq,
    SYNTH_LIMITS.frequency.min,
    SYNTH_LIMITS.frequency.max,
  );

  if (isPlaying) {
    stopAndDisconnectImmediately();
  }

  const ctx = getAudioContext();
  wireAndConfigureNodes(ctx);
  if (oscillator) {
    oscillator.frequency.value = currentFrequency;
    oscillator.start();
  }
  oscillator2?.start();
  applyEnvelopeAttack(ctx.currentTime);
  isPlaying = true;
}

export function noteOff() {
  if (!isPlaying || !audioContext || !oscillator) return;

  const osc = oscillator;
  const osc2 = oscillator2;
  const osc2Gain = oscillator2GainNode;
  const filter = filterNode;
  const envGain = envelopeGainNode;
  const masterGain = masterGainNode;
  const now = audioContext.currentTime;

  applyEnvelopeRelease(now);
  const stopAt = now + currentAdsr.release + 0.02;
  osc.stop(stopAt);
  osc2?.stop(stopAt);
  osc.onended = () => {
    osc.disconnect();
    osc2?.disconnect();
    osc2Gain?.disconnect();
    filter?.disconnect();
    envGain?.disconnect();
    masterGain?.disconnect();
  };

  oscillator = null;
  oscillator2 = null;
  oscillator2GainNode = null;
  filterNode = null;
  envelopeGainNode = null;
  masterGainNode = null;
  isPlaying = false;
}

export function start() {
  noteOn(currentFrequency);
}

export function stop() {
  noteOff();
}

export function setFrequency(freq: number) {
  currentFrequency = clamp(
    freq,
    SYNTH_LIMITS.frequency.min,
    SYNTH_LIMITS.frequency.max,
  );
  if (oscillator && audioContext) {
    oscillator.frequency.setTargetAtTime(
      currentFrequency,
      audioContext.currentTime,
      0.01,
    );
  }
  if (oscillator2 && audioContext) {
    oscillator2.frequency.setTargetAtTime(
      currentFrequency * semitonesToRatio(PRO_OSC_SEMITONES),
      audioContext.currentTime,
      0.01,
    );
  }
}

export function setWaveform(type: OscillatorType) {
  currentWaveform = type;
  if (oscillator) {
    oscillator.type = type;
  }
  if (oscillator2) {
    oscillator2.type = type;
  }
}

export function setGain(value: number) {
  currentVolume = clamp(value, SYNTH_LIMITS.volume.min, SYNTH_LIMITS.volume.max);
  if (masterGainNode && audioContext) {
    masterGainNode.gain.setTargetAtTime(
      currentVolume,
      audioContext.currentTime,
      0.01,
    );
  }
}

export function setFilterCutoff(value: number) {
  currentCutoff = clamp(value, SYNTH_LIMITS.cutoff.min, SYNTH_LIMITS.cutoff.max);
  if (filterNode && audioContext) {
    filterNode.frequency.setTargetAtTime(
      currentCutoff,
      audioContext.currentTime,
      0.01,
    );
  }
}

export function setAdsr(newValues: Partial<AdsrSettings>) {
  currentAdsr = normalizeAdsr(currentAdsr, newValues);
}

export function getSynthSettings() {
  return {
    frequency: currentFrequency,
    waveform: currentWaveform,
    volume: currentVolume,
    cutoff: currentCutoff,
    adsr: { ...currentAdsr },
    proEnabled,
  };
}

export function setProEnabled(enabled: boolean) {
  proEnabled = enabled;
}

export function getIsPlaying() {
  return isPlaying;
}

export function toggle() {
  if (isPlaying) {
    noteOff();
  } else {
    noteOn(currentFrequency);
  }
}
