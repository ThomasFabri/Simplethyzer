"use client";

import { memo } from "react";
import type { AdsrSettings } from "../types";

type SynthControlsProps = {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  cutoff: number;
  adsr: AdsrSettings;
  onFrequencyChange: (value: number) => void;
  onWaveformChange: (value: OscillatorType) => void;
  onVolumeChange: (value: number) => void;
  onCutoffChange: (value: number) => void;
  onAdsrChange: (values: Partial<AdsrSettings>) => void;
};

function SynthControls({
  frequency,
  waveform,
  volume,
  cutoff,
  adsr,
  onFrequencyChange,
  onWaveformChange,
  onVolumeChange,
  onCutoffChange,
  onAdsrChange,
}: SynthControlsProps) {
  return (
    <section className="w-full space-y-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Waveform
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["sine", "square", "sawtooth", "triangle"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onWaveformChange(type)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                waveform === type
                  ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                  : "border-zinc-700 hover:border-zinc-400"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <ControlRow
        label={`Frequency: ${Math.round(frequency)} Hz`}
        min={20}
        max={2000}
        step={1}
        value={frequency}
        onChange={onFrequencyChange}
      />
      <ControlRow
        label={`Volume: ${(volume * 100).toFixed(0)}%`}
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={onVolumeChange}
      />
      <ControlRow
        label={`Low-pass Cutoff: ${Math.round(cutoff)} Hz`}
        min={60}
        max={12000}
        step={1}
        value={cutoff}
        onChange={onCutoffChange}
      />

      <div className="space-y-3 border-t border-zinc-800 pt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          ADSR Envelope
        </p>
        <ControlRow
          label={`Attack: ${adsr.attack.toFixed(2)} s`}
          min={0.01}
          max={2}
          step={0.01}
          value={adsr.attack}
          onChange={(value) => onAdsrChange({ attack: value })}
        />
        <ControlRow
          label={`Decay: ${adsr.decay.toFixed(2)} s`}
          min={0.01}
          max={2}
          step={0.01}
          value={adsr.decay}
          onChange={(value) => onAdsrChange({ decay: value })}
        />
        <ControlRow
          label={`Sustain: ${(adsr.sustain * 100).toFixed(0)}%`}
          min={0}
          max={1}
          step={0.01}
          value={adsr.sustain}
          onChange={(value) => onAdsrChange({ sustain: value })}
        />
        <ControlRow
          label={`Release: ${adsr.release.toFixed(2)} s`}
          min={0.01}
          max={3}
          step={0.01}
          value={adsr.release}
          onChange={(value) => onAdsrChange({ release: value })}
        />
      </div>
    </section>
  );
}

type ControlRowProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

function ControlRow({ label, min, max, step, value, onChange }: ControlRowProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-zinc-200">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-100"
      />
    </label>
  );
}

export default memo(SynthControls);
