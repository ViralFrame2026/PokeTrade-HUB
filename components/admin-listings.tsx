"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

export type AdminListing = {
  created_at: string;
  id: string;
  moderation_status: string;
  seller: string;
  title: string;
  type: string;
};

type AdminListingsProps = {
  listings: AdminListing[];
};

export function AdminListings({ listings: initialListings }: AdminListingsProps) {
  const [listings, setListings] = useState(initialListings);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function moderate(
    listingId: string,
    action: "approve" | "reject"
  ) {
    const reason = rejectionReasons[listingId]?.trim();

    if (action === "reject" && (!reason || reason.length < 5)) {
      setError("Escribe un motivo de rechazo de al menos 5 caracteres.");
      return;
    }

    setBusyId(listingId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        body: JSON.stringify({
          action,
          reason: action === "reject" ? reason : null
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PATCH"
      });
      const payload = (await response.json()) as {
        error: string | null;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos moderar la publicacion.");
      }

      setListings((current) => current.filter((listing) => listing.id !== listingId));
    } catch (moderationError) {
      setError(
        moderationError instanceof Error
          ? moderationError.message
          : "No pudimos moderar la publicacion."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="p-8 text-center text-sm font-semibold text-slate-400">
        No hay publicaciones pendientes de moderacion.
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/[0.04] text-slate-400">
            <tr>
              <th className="px-5 py-4">Titulo</th>
              <th className="px-5 py-4">Tipo</th>
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Creada</th>
              <th className="px-5 py-4">Moderacion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {listings.map((listing) => (
              <tr key={listing.id}>
                <td className="px-5 py-4 font-bold text-white">{listing.title}</td>
                <td className="px-5 py-4 capitalize text-slate-300">{listing.type}</td>
                <td className="px-5 py-4 text-slate-300">{listing.seller}</td>
                <td className="px-5 py-4 text-slate-400">
                  {new Intl.DateTimeFormat("es", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(listing.created_at))}
                </td>
                <td className="px-5 py-4">
                  <div className="flex min-w-72 flex-col gap-2">
                    <input
                      className="rounded-md border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-red-300/60"
                      onChange={(event) =>
                        setRejectionReasons((current) => ({
                          ...current,
                          [listing.id]: event.target.value
                        }))
                      }
                      placeholder="Motivo si se rechaza"
                      value={rejectionReasons[listing.id] ?? ""}
                    />
                    <div className="flex gap-2">
                      <button
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-400 px-3 py-2 font-black text-emerald-950 disabled:opacity-60"
                        disabled={busyId === listing.id}
                        onClick={() => moderate(listing.id, "approve")}
                        type="button"
                      >
                        {busyId === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Aprobar
                      </button>
                      <button
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300/30 bg-red-500/10 px-3 py-2 font-black text-red-100 disabled:opacity-60"
                        disabled={busyId === listing.id}
                        onClick={() => moderate(listing.id, "reject")}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
