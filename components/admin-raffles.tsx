"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";

export type AdminRaffle = {
  closesAt: string;
  creator: string;
  id: string;
  prize: string;
  title: string;
};

export function AdminRaffles({ raffles: initialRaffles }: { raffles: AdminRaffle[] }) {
  const [raffles, setRaffles] = useState(initialRaffles);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function moderate(raffleId: string, action: "approve" | "reject") {
    const reason = reasons[raffleId]?.trim();
    if (action === "reject" && (!reason || reason.length < 5)) {
      setError("Escribe un motivo de rechazo de al menos 5 caracteres.");
      return;
    }

    setBusyId(raffleId);
    setError(null);
    setNotice(null);
    try {
      const moderatedRaffle = raffles.find((raffle) => raffle.id === raffleId);
      const response = await fetch(`/api/admin/raffles/${raffleId}`, {
        body: JSON.stringify({ action, reason: action === "reject" ? reason : null }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error?: string | null };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos moderar el sorteo.");
      }
      setRaffles((current) => current.filter((raffle) => raffle.id !== raffleId));
      setNotice(
        action === "approve"
          ? `Sorteo aprobado: ${moderatedRaffle?.title ?? "sorteo"}`
          : `Sorteo rechazado: ${moderatedRaffle?.title ?? "sorteo"}`
      );
    } catch (moderationError) {
      setError(
        moderationError instanceof Error
          ? moderationError.message
          : "No pudimos moderar el sorteo."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (!raffles.length) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-slate-400">
        No hay sorteos pendientes de moderacion.
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="m-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="m-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
          {notice}
        </div>
      ) : null}
      <div className="divide-y divide-white/10">
        {raffles.map((raffle) => (
          <article
            className="grid gap-4 p-5 lg:grid-cols-[1fr_320px] lg:items-center"
            key={raffle.id}
          >
            <div>
              <h3 className="font-black text-white">{raffle.title}</h3>
              <p className="mt-1 text-sm font-semibold text-yellow-300">{raffle.prize}</p>
              <p className="mt-2 text-xs text-slate-400">
                Organiza {raffle.creator} | Cierra{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(new Date(raffle.closesAt))}
              </p>
            </div>
            <div className="space-y-2">
              <input
                className="w-full rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-red-300/60"
                onChange={(event) =>
                  setReasons((current) => ({
                    ...current,
                    [raffle.id]: event.target.value
                  }))
                }
                placeholder="Motivo si se rechaza"
                value={reasons[raffle.id] ?? ""}
              />
              <div className="flex gap-2">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-400 px-3 py-2 text-sm font-black text-emerald-950 disabled:opacity-60"
                  disabled={busyId === raffle.id}
                  onClick={() => moderate(raffle.id, "approve")}
                  type="button"
                >
                  {busyId === raffle.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Aprobar
                </button>
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm font-black text-red-100 disabled:opacity-60"
                  disabled={busyId === raffle.id}
                  onClick={() => moderate(raffle.id, "reject")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
