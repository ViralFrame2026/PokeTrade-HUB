"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingStatusControlProps = {
  counterparties: Array<{
    id: string;
    name: string;
  }>;
  currentStatus: string;
  listingId: string;
  listingPrice: number | null;
  listingType: string;
};

const PLATFORM_COMMISSION_RATE = 0.05;

export function ListingStatusControl({
  counterparties,
  currentStatus,
  listingId,
  listingPrice,
  listingType
}: ListingStatusControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [counterpartyId, setCounterpartyId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedValue =
    listingType === "trade" ? "traded" : listingType === "free" ? "finished" : "sold";
  const closing = ["sold", "traded", "finished"].includes(status);
  const estimatedCommission =
    listingType === "sale" && listingPrice ? listingPrice * PLATFORM_COMMISSION_RATE : 0;
  const sellerNet = listingType === "sale" && listingPrice ? listingPrice - estimatedCommission : 0;

  async function saveStatus() {
    if (status === currentStatus) return;

    if (closing && !counterpartyId) {
      setError("Selecciona con quién concretaste la operación.");
      return;
    }
    if (
      closing &&
      !window.confirm("Esta publicación dejará de aparecer en el marketplace. ¿Continuar?")
    ) {
      setStatus(currentStatus);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        body: JSON.stringify({
          counterpartyId: closing ? counterpartyId : null,
          status
        }),
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
      {["sold", "traded", "finished"].includes(status) &&
      status !== currentStatus ? (
        <label className="mt-3 block text-xs font-black uppercase text-blue-800">
          Operación realizada con
          <select
            className="mt-2 h-10 w-full rounded-md border border-blue-200 bg-white px-3 text-sm font-bold normal-case text-blue-950 outline-none focus:border-blue-500"
            disabled={isSaving}
            onChange={(event) => setCounterpartyId(event.target.value)}
            required
            value={counterpartyId}
          >
            <option value="">Seleccionar usuario</option>
            {counterparties.map((counterparty) => (
              <option key={counterparty.id} value={counterparty.id}>
                {counterparty.name}
              </option>
            ))}
          </select>
          {counterparties.length === 0 ? (
            <span className="mt-2 block normal-case text-slate-500">
              Primero debes recibir un mensaje de la persona interesada.
            </span>
          ) : null}
        </label>
      ) : null}
      {closing && status !== currentStatus && listingType === "sale" && listingPrice ? (
        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
          <p className="font-black">Comisión estimada PokeTrade: 5%</p>
          <p className="mt-1 font-semibold">
            Comisión: {moneyLabel(estimatedCommission)} | Neto vendedor:{" "}
            {moneyLabel(sellerNet)}
          </p>
          <p className="mt-1 text-yellow-800">
            Está vista es informativa; todavía no hay cobro automatico conectado.
          </p>
        </div>
      ) : null}
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

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}
