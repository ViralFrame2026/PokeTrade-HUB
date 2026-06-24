"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  BadgeCheck,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  Store,
  X
} from "lucide-react";
import { DeleteListingButton } from "@/components/delete-listing-button";

export type AdminListing = {
  cardImage: string | null;
  cardName: string;
  condition: string;
  created_at: string;
  description: string;
  id: string;
  hasRealPhotos: boolean;
  location: string;
  moderation_status: string;
  price: number | null;
  rarity: string | null;
  seller: string;
  sellerJoinedAt: string | null;
  sellerRating: number;
  sellerReviews: number;
  sellerVerified: boolean;
  setName: string;
  title: string;
  tradeWants: string | null;
  type: string;
};

type AdminListingsProps = {
  listings: AdminListing[];
};

const LISTING_REJECTION_PRESETS = [
  "La descripción no explica el estado real de la carta.",
  "El producto no coincide con la carta oficial seleccionada.",
  "Faltan datos claros de precio, intercambio o entrega.",
  "La publicación contiene información engañosa o fuera de reglas."
];

function typeLabel(type: string) {
  return {
    free: "Gratis",
    sale: "Venta",
    trade: "Intercambio"
  }[type] ?? type;
}

function valueLabel(listing: AdminListing) {
  if (listing.type === "trade") return listing.tradeWants ? `Busca ${listing.tradeWants}` : "Intercambio";
  if (listing.type === "free") return "Gratis";

  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.price ?? 0);
}

function daysSince(dateValue: string | null) {
  if (!dateValue) return null;

  const createdAt = new Date(dateValue).getTime();
  if (Number.isNaN(createdAt)) return null;

  return Math.max(0, Math.floor((Date.now() - createdAt) / 86_400_000));
}

function reviewSignals(listing: AdminListing) {
  const accountAge = daysSince(listing.sellerJoinedAt);
  const descriptionLength = listing.description.trim().length;
  const signals = [
    {
      icon: Camera,
      label: listing.hasRealPhotos ? "Fotos reales cargadas" : "Sin fotos reales",
      tone: listing.hasRealPhotos ? "good" : "warn"
    },
    {
      icon: MapPin,
      label: listing.location ? "Ubicacion declarada" : "Ubicacion incompleta",
      tone: listing.location ? "good" : "warn"
    },
    {
      icon: Star,
      label:
        listing.sellerReviews > 0
          ? `${listing.sellerRating.toFixed(1)} (${listing.sellerReviews} reseñas)`
          : "Vendedor sin reseñas",
      tone: listing.sellerReviews > 0 ? "good" : "neutral"
    },
    {
      icon: BadgeCheck,
      label: listing.sellerVerified ? "Vendedor verificado" : "Vendedor no verificado",
      tone: listing.sellerVerified ? "good" : "neutral"
    },
    {
      icon: Clock3,
      label:
        accountAge === null
          ? "Antiguedad no disponible"
          : accountAge < 14
            ? `Cuenta nueva (${accountAge} dias)`
            : `Cuenta con ${accountAge} dias`,
      tone: accountAge !== null && accountAge < 14 ? "warn" : "good"
    },
    {
      icon: FileText,
      label: descriptionLength >= 40 ? "Descripcion suficiente" : "Descripcion breve",
      tone: descriptionLength >= 40 ? "good" : "warn"
    }
  ];

  if (listing.type === "sale" && Number(listing.price ?? 0) >= 100000) {
    signals.push({
      icon: AlertTriangle,
      label: "Precio alto: revisar coherencia",
      tone: "warn"
    });
  }

  return signals;
}

function reviewScore(listing: AdminListing) {
  return reviewSignals(listing).filter((signal) => signal.tone === "warn").length;
}

function signalClass(tone: string) {
  if (tone === "good") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  if (tone === "warn") return "border-yellow-300/40 bg-yellow-400/10 text-yellow-100";

  return "border-white/10 bg-white/[0.04] text-slate-300";
}

export function AdminListings({ listings: initialListings }: AdminListingsProps) {
  const [listings, setListings] = useState(initialListings);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    setNotice(null);

    try {
      const moderatedListing = listings.find((listing) => listing.id === listingId);
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
        throw new Error(payload.error ?? "No pudimos moderar la publicación.");
      }

      setListings((current) => current.filter((listing) => listing.id !== listingId));
      setNotice(
        action === "approve"
          ? `Publicación aprobada: ${moderatedListing?.cardName ?? "carta"}`
          : `Publicación rechazada: ${moderatedListing?.cardName ?? "carta"}`
      );
    } catch (moderationError) {
      setError(
        moderationError instanceof Error
          ? moderationError.message
          : "No pudimos moderar la publicación."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="grid min-h-44 place-items-center p-8 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
          <p className="mt-3 text-sm font-semibold text-slate-400">
            No hay publicaciones pendientes de moderación.
          </p>
        </div>
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
        {listings.map((listing) => {
          const signals = reviewSignals(listing);
          const warnings = reviewScore(listing);

          return (
          <article
            className="grid gap-5 p-5 lg:grid-cols-[112px_minmax(0,1fr)_360px] lg:items-center"
            key={listing.id}
          >
            <div className="relative h-36 overflow-hidden rounded-lg border border-white/10 bg-slate-950/70">
              {listing.cardImage ? (
                <Image
                  alt={listing.cardName}
                  className="object-contain p-2"
                  fill
                  sizes="112px"
                  src={listing.cardImage}
                />
              ) : (
                <Store className="absolute inset-0 m-auto h-8 w-8 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-slate-950">
                  {typeLabel(listing.type)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                  {listing.condition}
                </span>
                {listing.rarity ? (
                  <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-bold text-blue-100">
                    {listing.rarity}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 truncate text-xl font-black text-white">{listing.cardName}</h3>
              <p className="mt-1 text-sm font-semibold text-yellow-300">{listing.setName}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                {listing.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                <span>{listing.seller}</span>
                {listing.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.location}
                  </span>
                ) : null}
                <span>
                  {new Intl.DateTimeFormat("es", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(listing.created_at))}
                </span>
              </div>
              <p className="mt-3 text-sm font-black text-yellow-300">{valueLabel(listing)}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black uppercase tracking-[0.12em] text-yellow-300">
                    Riesgo de revision
                  </p>
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black",
                      warnings === 0
                        ? "bg-emerald-400/15 text-emerald-100"
                        : warnings <= 2
                          ? "bg-yellow-400/15 text-yellow-100"
                          : "bg-red-400/15 text-red-100"
                    ].join(" ")}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {warnings === 0 ? "Bajo" : warnings <= 2 ? "Medio" : "Alto"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  {signals.map((signal) => {
                    const Icon = signal.icon;

                    return (
                      <span
                        className={[
                          "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-bold",
                          signalClass(signal.tone)
                        ].join(" ")}
                        key={`${listing.id}-${signal.label}`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {signal.label}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="hidden rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs leading-5 text-slate-300">
                <p className="font-black uppercase tracking-[0.12em] text-yellow-300">
                  Checklist
                </p>
                <ul className="mt-2 space-y-1">
                  <li>Datos de carta oficial coinciden.</li>
                  <li>Precio, estado y descripción son claros.</li>
                  <li>No promete productos fuera de reglas.</li>
                </ul>
              </div>
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
              <div className="flex flex-wrap gap-2">
                {LISTING_REJECTION_PRESETS.map((preset) => (
                  <button
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-left text-[11px] font-bold text-slate-300 transition hover:border-red-300/50 hover:text-red-100"
                    key={preset}
                    onClick={() =>
                      setRejectionReasons((current) => ({
                        ...current,
                        [listing.id]: preset
                      }))
                    }
                    type="button"
                  >
                    {preset}
                  </button>
                ))}
              </div>
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
              <DeleteListingButton
                listingId={listing.id}
                onDeleted={() =>
                  setListings((current) => current.filter((item) => item.id !== listing.id))
                }
                title={listing.cardName}
              />
            </div>
          </article>
          );
        })}
      </div>
    </>
  );
}
