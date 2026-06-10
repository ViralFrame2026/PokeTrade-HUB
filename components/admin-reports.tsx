"use client";

import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
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

const reasonLabels: Record<string, string> = {
  fake_listing: "Publicacion falsa",
  misleading_information: "Informacion engañosa",
  missing_product: "Producto no disponible",
  scam: "Posible estafa",
  suspicious_behavior: "Comportamiento sospechoso"
};

export function AdminReports({ reports: initialReports }: { reports: AdminReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolveReport(reportId: string) {
    setBusyId(reportId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, { method: "PATCH" });
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
    return <div className="p-8 text-center text-sm font-semibold text-slate-400">No hay reportes abiertos.</div>;
  }

  return (
    <div className="p-5">
      {error ? (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5" key={report.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-red-300">
                  {reasonLabels[report.reason] ?? report.reason}
                </p>
                <h3 className="mt-2 font-black text-white">{report.listingTitle}</h3>
              </div>
              <span className="text-xs text-slate-500">
                {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
                  new Date(report.createdAt)
                )}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{report.details}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-bold text-white hover:border-yellow-300"
                href={`/listings/${report.listingId}`}
                target="_blank"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir publicacion
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
        ))}
      </div>
    </div>
  );
}
