"use client";

import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { Dices, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DrawRaffleWinnerButton({
  disabled,
  raffleId
}: {
  disabled: boolean;
  raffleId: string;
}) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function drawWinner() {
    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/raffles/${raffleId}/draw`, {
        method: "POST"
      });
      const payload = (await response.json()) as { error?: string | null };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos elegir al ganador.");
      }
      router.refresh();
    } catch (drawError) {
      setError(
        drawError instanceof Error ? drawError.message : "No pudimos elegir al ganador."
      );
    } finally {
      setIsBusy(false);
      setIsConfirming(false);
    }
  }

  return (
    <div className="w-full">
      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || isBusy}
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Dices className="h-4 w-4" />}
        Elegir ganador
      </button>
      {isConfirming ? (
        <ConfirmActionModal
          body="El sistema elegira un ganador al azar. Esta accion no se puede repetir."
          confirmLabel="Si, elegir ganador"
          isBusy={isBusy}
          onCancel={() => setIsConfirming(false)}
          onConfirm={drawWinner}
          title="Elegir ganador"
        />
      ) : null}
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
