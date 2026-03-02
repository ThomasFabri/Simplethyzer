"use client";

import { useCallback, useState } from "react";
import type { AdsrSettings } from "../types";
import {
  getIsPlaying,
  getSynthSettings,
  noteOff,
  noteOn,
  setAdsr,
  setFilterCutoff,
  setFrequency,
  setGain,
  setWaveform,
} from "../audio/synthEngine";

export function useSynth() {
  const [settings, setSettings] = useState(() => getSynthSettings());
  const [playing, setPlaying] = useState(() => getIsPlaying());

  const handleFrequencyChange = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, frequency: value }));
    setFrequency(value);
  }, []);

  const handleWaveformChange = useCallback((value: OscillatorType) => {
    setSettings((prev) => ({ ...prev, waveform: value }));
    setWaveform(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, volume: value }));
    setGain(value);
  }, []);

  const handleCutoffChange = useCallback((value: number) => {
    setSettings((prev) => ({ ...prev, cutoff: value }));
    setFilterCutoff(value);
  }, []);

  const handleAdsrChange = useCallback((values: Partial<AdsrSettings>) => {
    setSettings((prev) => ({ ...prev, adsr: { ...prev.adsr, ...values } }));
    setAdsr(values);
  }, []);

  const togglePlay = useCallback(() => {
    if (getIsPlaying()) {
      noteOff();
      setPlaying(false);
      return;
    }

    noteOn(settings.frequency);
    setPlaying(true);
  }, [settings.frequency]);

  const playNote = useCallback((frequency: number) => {
    noteOn(frequency);
    setSettings((prev) => ({ ...prev, frequency }));
    setPlaying(true);
  }, []);

  const releaseNote = useCallback(() => {
    noteOff();
    setPlaying(false);
  }, []);

  return {
    playing,
    settings,
    actions: {
      togglePlay,
      playNote,
      releaseNote,
      handleFrequencyChange,
      handleWaveformChange,
      handleVolumeChange,
      handleCutoffChange,
      handleAdsrChange,
    },
  };
}
