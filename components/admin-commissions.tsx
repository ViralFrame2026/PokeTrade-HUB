"use client";

import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { CheckCircle2, Clock3, FileText, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

export type AdminCommission = {
  cardName: string;
  commission: number;
  createdAt: string;
  id: string;
  price: number;
  seller: string;
  sellerNet: number;
  setName: string;
  status: string;
};

const statusOptions = [
  { icon: Clock3, label: "Pendiente", value: "pending" },
  { icon: FileText, label: "Facturada", value: "invoiced" },
  { icon: CheckCircle2, label: "Pagada", value: "paid" },
  { icon: XCircle, label: "Perdonada", value: "waived" }
];

const statusLabels: Record<string, string> = {
  estimada: "Estimada",
  invoiced: "Facturada",
  paid: "Pagada",
  pending: "Pendiente",
  waived: "Perdonada"
};

function moneyLabel(value: number) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function statusClassName(status: string) {
  return {
    estimada: "border-slate-400/30 bg-slate-400/10 text-slate-300",
    invoiced: "border-blue-300/30 bg-blue-500/10 text-blue-100",
    paid: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
    pending: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
    waived: "border-red-300/30 bg-red-500/10 text-red-100"
  }[status] ?? "border-white/10 bg-white/[0.06] text-slate-300";
}

export function AdminCommissions({
  commissions: initialCommissions,
  ledgerEnabled
}: {
  commissions: AdminCommission[];
  ledgerEnabled: boolean;
}) {
  const [commissions, setCommissions] = useState(initialCommissions);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    commission: AdminCommission;
    label: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(commission: AdminCommission, status: string) {
    if (commission.status === status || commission.status === "estimada") return;

    setBusyId(commission.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/commissions/${commission.id}`, {
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos actualizar la comisión.");
      }

      setCommissions((current) =>
        current.map((item) => (item.id === commission.id ? { ...item, status } : item))
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "No pudimos actualizar la comisión."
      );
    } finally {
      setBusyId(null);
      setPendingAction(null);
    }
  }

  if (commissions.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-400">
        Todavía no hay ventas cerradas para calcular comisiones.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      {!ledgerEnabled ? (
        <div className="mb-4 rounded-lg border border-yellow-300/30 bg-yellow-400/10 p-4 text-sm font-semibold text-yellow-100">
          Estas filas son estimadas. Pega la migración de comisiones en Supabase para activar
          estados reales.
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-400">
            <tr>
              <th className="px-4 py-3">Carta</th>
              <th className="px-4 py-3">Vendedor</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Venta</th>
              <th className="px-4 py-3 text-right">Comisión</th>
              <th className="px-4 py-3 text-right">Neto vendedor</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {commissions.map((commission) => (
              <tr key={commission.id}>
                <td className="px-4 py-3">
                  <p className="font-black text-white">{commission.cardName}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{commission.setName}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-300">{commission.seller}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClassName(
                      commission.status
                    )}`}
                  >
                    {statusLabels[commission.status] ?? commission.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                    new Date(commission.createdAt)
                  )}
                </td>
                <td className="px-4 py-3 text-right font-black text-white">
                  {moneyLabel(commission.price)}
                </td>
                <td className="px-4 py-3 text-right font-black text-yellow-300">
                  {moneyLabel(commission.commission)}
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-200">
                  {moneyLabel(commission.sellerNet)}
                </td>
                <td className="px-4 py-3">
                  {commission.status === "estimada" ? (
                    <span className="block text-right text-xs font-semibold text-slate-500">
                      Sin registro
                    </span>
                  ) : (
                    <div className="flex justify-end gap-1">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const selected = commission.status === option.value;

                        return (
                          <button
                            aria-label={option.label}
                            className={`grid h-9 w-9 place-items-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "border-yellow-300 bg-yellow-400 text-slate-950"
                                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-yellow-300"
                            }`}
                            disabled={busyId === commission.id || selected}
                            key={option.value}
                            onClick={() =>
                              setPendingAction({
                                commission,
                                label: statusLabels[option.value]?.toLowerCase() ?? option.value,
                                status: option.value
                              })
                            }
                            title={option.label}
                            type="button"
                          >
                            {busyId === commission.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pendingAction ? (
        <ConfirmActionModal
          body={`Vas a marcar esta comisión como ${pendingAction.label}.`}
          confirmLabel="Sí, actualizar"
          isBusy={busyId === pendingAction.commission.id}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => updateStatus(pendingAction.commission, pendingAction.status)}
          title="Actualizar comisión"
        />
      ) : null}
    </div>
  );
}
