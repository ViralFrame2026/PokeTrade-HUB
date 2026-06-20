"use client";

import { CheckCircle2, Gift, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RaffleEntryButton({
  isAuthenticated,
  isEntered,
  raffleId
}: {
  isAuthenticated: boolean;
  isEntered: boolean;
  raffleId: string;
}) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterRaffle() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/raffles/${raffleId}`)}`);
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/raffles/${raffleId}/entries`, {
        method: "POST"
      });
      const payload = (await response.json()) as { error?: string | null };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos registrar tu participación.");
      }
      router.refresh();
    } catch (entryError) {
      setError(
        entryError instanceof Error
          ? entryError.message
          : "No pudimos registrar tu participación."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-4 font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy || isEntered}
        onClick={enterRaffle}
        type="button"
      >
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isEntered ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Gift className="h-5 w-5" />
        )}
        {isEntered ? "Ya estas participando" : "Participar gratis"}
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
    </>
  );
}
