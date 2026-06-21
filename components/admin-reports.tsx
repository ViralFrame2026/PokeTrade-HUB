"use client";

import { AlertTriangle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type AdminReport = {
  createdAt: string;
  details: string;
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
};

const resolutionOptions = [
  {
    label: "Sin riesgo confirmado",
    value: "reviewed_no_issue"
  },
  {
    label: "Vendedor advertido",
    value: "seller_warned"
  },
  {
    label: "Medidas tomadas",
    value: "listing_action_taken"
  }
] as const;

const reasonLabels: Record<string, string> = {
  fake_listing: "Publicación falsa",
  misleading_information: "Información engañosa",
  missing_product: "Producto no disponible",
  scam: "Posible estafa",
  suspicious_behavior: "Comportamiento sospechoso"
};

const highRiskReasons = new Set(["scam", "fake_listing", "suspicious_behavior"]);

function reportPriority(reason: string) {
  if (highRiskReasons.has(reason)) {
    return {
      className: "border-red-300/40 bg-red-500/15 text-red-100",
      label: "Alta prioridad"
    };
  }

  return {
    className: "border-yellow-300/30 bg-yellow-400/10 text-yellow-100",
    label: "Revisión normal"
  };
}

function reportAgeLabel(createdAt: string) {
  const hours = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
  );

  if (hours < 1) return "Hace menos de 1 hora";
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? "" : "s"}`;
}

export function AdminReports({ reports: initialReports }: { reports: AdminReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [outcomes, setOutcomes] = useState<
    Record<string, (typeof resolutionOptions)[number]["value"]>
  >({});

  async function resolveReport(reportId: string) {
    if (!window.confirm("¿Marcar este reporte como resuelto?")) {
      return;
    }

    setBusyId(reportId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        body: JSON.stringify({
          note: notes[reportId]?.trim() || undefined,
          outcome: outcomes[reportId] ?? "reviewed_no_issue"
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos resolver el reporte.");
      }

      setReports((current) => current.filter((report) => report.id !== reportId));
    } catch (resolveError) {
      setError(
        resolveError instanceof Error
          ? resolveError.message
          : "No pudimos resolver el reporte."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="grid min-h-44 place-items-center p-8 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
          <p className="mt-3 text-sm font-semibold text-slate-400">No hay reportes abiertos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => {
          const priority = reportPriority(report.reason);

          return (
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={report.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${priority.className}`}
                  >
                    {priority.label}
                  </span>
                  <span className="text-xs font-black uppercase text-red-300">
                    {reasonLabels[report.reason] ?? report.reason}
                  </span>
                </div>
                <h3 className="mt-2 font-black text-white">{report.listingTitle}</h3>
              </div>
              <span className="text-right text-xs font-semibold text-slate-500">
                <span className="block text-slate-300">{reportAgeLabel(report.createdAt)}</span>
                {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                  new Date(report.createdAt)
                )}
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-xs leading-5 text-red-100">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Abrí la publicación, revisá el motivo y resolvé solo cuando hayas tomado
                  acción o confirmado que no hay riesgo.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{report.details}</p>
            <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/30 p-3">
              <label className="text-xs font-black uppercase tracking-[0.14em] text-yellow-300">
                Resultado interno
              </label>
              <select
                className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm font-bold text-white outline-none focus:border-yellow-300"
                onChange={(event) =>
                  setOutcomes((current) => ({
                    ...current,
                    [report.id]: event.target.value as (typeof resolutionOptions)[number]["value"]
                  }))
                }
                value={outcomes[report.id] ?? "reviewed_no_issue"}
              >
                {resolutionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                className="mt-3 min-h-20 w-full resize-y rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-yellow-300"
                maxLength={500}
                onChange={(event) =>
                  setNotes((current) => ({
                    ...current,
                    [report.id]: event.target.value
                  }))
                }
                placeholder="Nota opcional para auditoria y notificacion"
                value={notes[report.id] ?? ""}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white hover:border-yellow-300"
                href={`/listings/${report.listingId}`}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir publicación
              </Link>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-3 py-2 text-sm font-black text-emerald-950 disabled:opacity-60"
                disabled={busyId === report.id}
                onClick={() => resolveReport(report.id)}
                type="button"
              >
                {busyId === report.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Resolver
              </button>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
