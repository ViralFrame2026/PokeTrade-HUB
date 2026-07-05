"use client";

import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { AlertTriangle, Check, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedValue =
    listingType === "trade" ? "traded" : listingType === "free" ? "finished" : "sold";
  const closing = ["sold", "traded", "finished"].includes(status);
  const changing = status !== currentStatus;
  const selectedCounterparty = counterparties.find((item) => item.id === counterpartyId);
  const estimatedCommission =
    listingType === "sale" && listingPrice ? listingPrice * PLATFORM_COMMISSION_RATE : 0;
  const sellerNet = listingType === "sale" && listingPrice ? listingPrice - estimatedCommission : 0;
  const closeLabel =
    listingType === "trade"
      ? "Confirmar intercambio"
      : listingType === "free"
        ? "Confirmar entrega"
        : "Confirmar venta";
  const closingEffects = useMemo(() => {
    if (!closing || !changing) return [];

    const effects = [
      "La publicación deja de aparecer activa en el marketplace.",
      "La otra persona recibe una notificación para valorar la operación."
    ];

    if (listingType === "sale") {
      effects.push("Se registra la comision interna de NexoTCG.");
    }

    return effects;
  }, [changing, closing, listingType]);

  async function saveStatus() {
    if (!changing) return;

    if (closing && !counterpartyId) {
      setError("Selecciona con quién concretaste la operación.");
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
      setIsConfirming(false);
    }
  }

  function requestStatusSave() {
    if (!changing) return;

    if (closing && !counterpartyId) {
      setError("Selecciona con quién concretaste la operación.");
      return;
    }

    if (closing) {
      setIsConfirming(true);
      return;
    }

    void saveStatus();
  }

  return (
    <div className="w-full rounded-lg border border-blue-100 bg-blue-50 p-3">
      <label className="text-xs font-black uppercase text-blue-800">
        Disponibilidad
        <select
          className="mt-2 h-10 w-full rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-950 outline-none focus:border-blue-500"
          disabled={isSaving}
          onChange={(event) => {
            setStatus(event.target.value);
            setError(null);
          }}
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

      {closing && changing ? (
        <div className="mt-3 rounded-lg border border-blue-200 bg-white p-3">
          <label className="block text-xs font-black uppercase text-blue-800">
            Operacion realizada con
            <select
              className="mt-2 h-10 w-full rounded-md border border-blue-200 bg-white px-3 text-sm font-bold normal-case text-blue-950 outline-none focus:border-blue-500"
              disabled={isSaving}
              onChange={(event) => {
                setCounterpartyId(event.target.value);
                setError(null);
              }}
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
          </label>

          {counterparties.length === 0 ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs font-semibold leading-5 text-yellow-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Primero debes recibir un mensaje de la persona interesada para poder cerrar
              la operación con ella.
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-xs font-semibold leading-5 text-slate-600">
              {closingEffects.map((effect) => (
                <p className="flex items-start gap-2" key={effect}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {effect}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {closing && changing && listingType === "sale" && listingPrice ? (
        <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
          <p className="font-black">Comision estimada NexoTCG: 5%</p>
          <p className="mt-1 font-semibold">
            Comision: {moneyLabel(estimatedCommission)} | Neto vendedor:{" "}
            {moneyLabel(sellerNet)}
          </p>
          <p className="mt-1 text-yellow-800">
            Es un registro interno; todavia no hay cobro automatico conectado.
          </p>
        </div>
      ) : null}

      <button
        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-3 text-xs font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSaving || !changing || (closing && !counterpartyId)}
        onClick={requestStatusSave}
        type="button"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : closing ? (
          <UserCheck className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {closing && changing ? closeLabel : "Actualizar estado"}
      </button>
      {isConfirming ? (
        <ConfirmActionModal
          body={`${closeLabel}: esta acción cierra la publicación y avisa a ${
            selectedCounterparty?.name ?? "la otra persona"
          }.`}
          confirmLabel="Si, confirmar"
          isBusy={isSaving}
          onCancel={() => {
            setIsConfirming(false);
            setStatus(currentStatus);
          }}
          onConfirm={saveStatus}
          title={closeLabel}
        />
      ) : null}
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
