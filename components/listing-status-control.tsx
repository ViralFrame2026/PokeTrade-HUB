"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingStatusControlProps = {
  currentStatus: string;
  listingId: string;
  listingType: string;
};

export function ListingStatusControl({
  currentStatus,
  listingId,
  listingType
}: ListingStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedValue =
    listingType === "trade" ? "traded" : listingType === "free" ? "finished" : "sold";

  async function saveStatus() {
    if (status === currentStatus) return;

    const closing = ["sold", "traded", "finished"].includes(status);
    if (
      closing &&
      !window.confirm("Esta publicacion dejara de aparecer en el marketplace. ¿Continuar?")
    ) {
      setStatus(currentStatus);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos cambiar el estado.");
      }

      router.refresh();
    } catch (statusError) {
      setStatus(currentStatus);
      setError(
        statusError instanceof Error
          ? statusError.message
          : "No pudimos cambiar el estado."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full rounded-lg border border-blue-100 bg-blue-50 p-3">
      <label className="text-xs font-black uppercase text-blue-800">
        Disponibilidad
        <select
          className="mt-2 h-10 w-full rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-950 outline-none focus:border-blue-500"
          disabled={isSaving}
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option value="active">Disponible</option>
          <option value="reserved">Reservada</option>
          <option value={completedValue}>
            {listingType === "trade"
              ? "Intercambiada"
              : listingType === "free"
                ? "Finalizada"
                : "Vendida"}
          </option>
        </select>
      </label>
      <button
        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-3 text-xs font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSaving || status === currentStatus}
        onClick={saveStatus}
        type="button"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Actualizar estado
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
