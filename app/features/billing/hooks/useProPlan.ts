"use client";

import { useCallback, useEffect, useState } from "react";

type ProStatusResponse = {
  isPro: boolean;
};

export function useProPlan() {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pro/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch plan status");
      const data = (await response.json()) as ProStatusResponse;
      setIsPro(Boolean(data.isPro));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Nao foi possivel verificar o plano.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmCheckout = useCallback(
    async (sessionId: string) => {
      try {
        const response = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) throw new Error("Failed to confirm checkout");
        await refreshStatus();
      } catch (err) {
        console.error(err);
        setError("Pagamento detectado, mas a ativacao do Pro falhou.");
      } finally {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("checkout");
        currentUrl.searchParams.delete("session_id");
        window.history.replaceState({}, "", currentUrl.toString());
      }
    },
    [refreshStatus],
  );

  const startCheckout = useCallback(async () => {
    try {
      setIsCheckoutLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Failed to start checkout");
      const data = (await response.json()) as { url?: string };
      if (!data.url) throw new Error("Missing checkout URL");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Nao foi possivel iniciar o checkout.");
      setIsCheckoutLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get("checkout");
    const sessionId = params.get("session_id");

    if (checkoutState === "success" && sessionId) {
      void confirmCheckout(sessionId);
    }
  }, [confirmCheckout]);

  return {
    isPro,
    isLoading,
    isCheckoutLoading,
    error,
    startCheckout,
    refreshStatus,
  };
}
