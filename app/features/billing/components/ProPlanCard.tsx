"use client";

type ProPlanCardProps = {
  isPro: boolean;
  isLoading: boolean;
  isCheckoutLoading: boolean;
  error: string | null;
  onUpgrade: () => void;
};

export default function ProPlanCard({
  isPro,
  isLoading,
  isCheckoutLoading,
  error,
  onUpgrade,
}: ProPlanCardProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Plano Pro</p>
          <h2 className="text-lg font-semibold text-zinc-100">
            {isPro ? "Ativo" : "Desbloqueie recursos premium"}
          </h2>
          <p className="mt-1 text-sm text-zinc-300">
            Inclui segundo oscilador para timbres mais encorpados.
          </p>
        </div>
        {isPro ? (
          <span className="rounded-md bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">
            Pro ativo
          </span>
        ) : (
          <button
            onClick={onUpgrade}
            disabled={isCheckoutLoading || isLoading}
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckoutLoading ? "Abrindo checkout..." : "Fazer upgrade"}
          </button>
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
