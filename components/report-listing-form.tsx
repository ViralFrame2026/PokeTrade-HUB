"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportListingForm({
  initialReported = false,
  isAuthenticated,
  listingId
}: {
  initialReported?: boolean;
  isAuthenticated: boolean;
  listingId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("misleading_information");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(initialReported);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reports", {
        body: JSON.stringify({ details, listingId, reason }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos enviar el reporte.");
      }

      setSuccess(true);
      setDetails("");
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : "No pudimos enviar el reporte."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
        <CheckCircle2 className="h-5 w-5" />
        {initialReported ? "Ya reportaste esta publicacion." : "Reporte enviado a moderacion."}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <button
        className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <AlertTriangle className="h-4 w-4" />
        Reportar publicacion
      </button>

      {isOpen ? (
        <form
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4"
          onSubmit={submitReport}
        >
          <label className="text-sm font-bold text-red-900">
            Motivo
            <select
              className="mt-2 h-11 w-full rounded-lg border border-red-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-red-400"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            >
              <option value="misleading_information">Informacion engañosa</option>
              <option value="fake_listing">Carta o publicacion falsa</option>
              <option value="missing_product">Producto no disponible</option>
              <option value="scam">Posible estafa</option>
              <option value="suspicious_behavior">Comportamiento sospechoso</option>
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold text-red-900">
            Detalles
            <textarea
              className="mt-2 min-h-24 w-full rounded-lg border border-red-200 bg-white px-3 py-3 text-slate-900 outline-none focus:border-red-400"
              maxLength={1000}
              minLength={10}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Explica brevemente el problema."
              required
              value={details}
            />
          </label>
          {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
          <button
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enviar reporte
          </button>
        </form>
      ) : null}
    </div>
  );
}
