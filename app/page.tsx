"use client"

import { useEffect } from "react"
import ProPlanCard from "./features/billing/components/ProPlanCard"
import { useProPlan } from "./features/billing/hooks/useProPlan"
import Keyboard from "./features/synth/components/Keyboard"
import SynthControls from "./features/synth/components/SynthControls"
import { useSynth } from "./features/synth/hooks/useSynth"

export default function Home() {
  const { playing, settings, actions } = useSynth()
  const proPlan = useProPlan()
  const setProFeature = actions.handleSetProEnabled

  useEffect(() => {
    setProFeature(proPlan.isPro)
  }, [setProFeature, proPlan.isPro])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Simplethyzer</h1>
          <button
            onClick={actions.togglePlay}
            className={`rounded-md px-5 py-2 font-medium transition ${
              playing
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-emerald-500 text-black hover:bg-emerald-400"
            }`}
          >
            {playing ? "Stop" : "Play"}
          </button>
        </div>

        <ProPlanCard
          isPro={proPlan.isPro}
          isLoading={proPlan.isLoading}
          isCheckoutLoading={proPlan.isCheckoutLoading}
          error={proPlan.error}
          onUpgrade={proPlan.startCheckout}
        />

        <SynthControls
          frequency={settings.frequency}
          waveform={settings.waveform}
          volume={settings.volume}
          cutoff={settings.cutoff}
          adsr={settings.adsr}
          onFrequencyChange={actions.handleFrequencyChange}
          onWaveformChange={actions.handleWaveformChange}
          onVolumeChange={actions.handleVolumeChange}
          onCutoffChange={actions.handleCutoffChange}
          onAdsrChange={actions.handleAdsrChange}
        />

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="mb-3 text-sm text-zinc-300">
            Keyboard (changes frequency) {settings.proEnabled ? "- Pro Osc 2 ON" : ""}
          </p>
          <Keyboard onNoteDown={actions.playNote} onNoteUp={actions.releaseNote} />
        </div>
      </main>
    </div>
  )
}
