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
  const [entered, setEntered] = useState(isEntered);
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
        throw new Error(payload.error ?? "No pudimos registrar tu participacion.");
      }

      setEntered(true);
      router.refresh();
    } catch (entryError) {
      setError(
        entryError instanceof Error
          ? entryError.message
          : "No pudimos registrar tu participacion."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-4 font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy || entered}
        onClick={enterRaffle}
        type="button"
      >
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : entered ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Gift className="h-5 w-5" />
        )}
        {entered ? "Ya estas participando" : "Participar gratis"}
      </button>
      {entered ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-black text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Participacion registrada
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-300">{error}</p> : null}
    </>
  );
}
