import type { AdsrSettings } from "../types";
import { clamp, normalizeAdsr, SYNTH_LIMITS } from "./synthMath";

let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let envelopeGainNode: GainNode | null = null;
let masterGainNode: GainNode | null = null;
let isPlaying = false;

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
  filterNode.type = "lowpass";
  filterNode.frequency.value = currentCutoff;
  envelopeGainNode.gain.value = 0;
  masterGainNode.gain.value = currentVolume;
}

function stopAndDisconnectImmediately() {
  if (!oscillator) return;

  const osc = oscillator;
  const filter = filterNode;
  const envGain = envelopeGainNode;
  const masterGain = masterGainNode;

  try {
    osc.stop();
  } catch {
    // Oscillator may already be stopped.
  }
  osc.disconnect();
  filter?.disconnect();
  envGain?.disconnect();
  masterGain?.disconnect();

  oscillator = null;
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
  applyEnvelopeAttack(ctx.currentTime);
  isPlaying = true;
}

export function noteOff() {
  if (!isPlaying || !audioContext || !oscillator) return;

  const osc = oscillator;
  const filter = filterNode;
  const envGain = envelopeGainNode;
  const masterGain = masterGainNode;
  const now = audioContext.currentTime;

  applyEnvelopeRelease(now);
  osc.stop(now + currentAdsr.release + 0.02);
  osc.onended = () => {
    osc.disconnect();
    filter?.disconnect();
    envGain?.disconnect();
    masterGain?.disconnect();
  };

  oscillator = null;
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
}

export function setWaveform(type: OscillatorType) {
  currentWaveform = type;
  if (oscillator) {
    oscillator.type = type;
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
  };
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
