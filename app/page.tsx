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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1c273a_0%,#09090b_55%)] text-zinc-100">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Simplethyzer</p>
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
                Synth web monetizavel com audio em tempo real e checkout Stripe.
              </h1>
              <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
                Demo focada em portfolio tecnico: Web Audio API, plano Pro e deploy em
                producao.
              </p>
            </div>
            <a
              href="#studio"
              className="inline-flex w-fit items-center rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              Ir para o studio
            </a>
          </div>
          <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            <article className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <h2 className="font-semibold">1. Som instantaneo</h2>
              <p className="mt-1 text-zinc-300">Oscilador, ADSR e filtro low-pass ajustaveis.</p>
            </article>
            <article className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <h2 className="font-semibold">2. Conversao</h2>
              <p className="mt-1 text-zinc-300">Upgrade para Plano Pro com checkout Stripe.</p>
            </article>
            <article className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <h2 className="font-semibold">3. Recurso premium</h2>
              <p className="mt-1 text-zinc-300">Segundo oscilador liberado apenas para Pro.</p>
            </article>
          </div>
        </section>

        <section id="studio" className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Studio</h2>
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
            info={proPlan.info}
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
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-lg font-semibold">Como usar</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>Clique em Play para iniciar o synth.</li>
            <li>Ajuste waveform, ADSR, volume e cutoff.</li>
            <li>Toque as notas pelo teclado visual.</li>
            <li>Ative Pro para liberar o segundo oscilador.</li>
          </ol>
        </section>
        <footer className="pb-3 text-center text-xs text-zinc-500">
          Simplethyzer • Demo tecnica para portfolio
        </footer>
      </main>
    </div>
  )
}
