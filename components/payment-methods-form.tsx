"use client";

import { CheckCircle2, Loader2, Save, WalletCards } from "lucide-react";
import { useState } from "react";

type PaymentMethodsFormProps = {
  initialValues: {
    paymentAlias: string;
    paymentCvu: string;
    paymentHolderName: string;
    paymentNotes: string;
  };
};

export function PaymentMethodsForm({ initialValues }: PaymentMethodsFormProps) {
  const [paymentAlias, setPaymentAlias] = useState(initialValues.paymentAlias);
  const [paymentCvu, setPaymentCvu] = useState(initialValues.paymentCvu);
  const [paymentHolderName, setPaymentHolderName] = useState(initialValues.paymentHolderName);
  const [paymentNotes, setPaymentNotes] = useState(initialValues.paymentNotes);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submitPaymentMethods(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      const response = await fetch("/api/account/payment-methods", {
        body: JSON.stringify({
          paymentAlias,
          paymentCvu,
          paymentHolderName,
          paymentNotes
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos guardar tus metodos de cobro.");
      }

      setSaved(true);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No pudimos guardar tus metodos de cobro."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="rounded-lg border border-blue-100 bg-white p-5 shadow-[0_18px_45px_rgba(30,64,175,0.12)]" onSubmit={submitPaymentMethods}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-yellow-400 text-blue-950">
          <WalletCards className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-blue-950">Metodos de cobro del vendedor</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
            Estos datos te sirven para compartirlos cuando cierres una venta por mensaje.
            NexoTCG no procesa el pago del comprador automaticamente.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-blue-950">
          Alias o usuario de Mercado Pago
          <input
            className="min-h-12 rounded-lg border border-blue-100 bg-blue-50 px-4 font-semibold text-blue-950 outline-none transition focus:border-yellow-400 focus:bg-white"
            maxLength={120}
            onChange={(event) => setPaymentAlias(event.target.value)}
            placeholder="ej: nexotcg.mp"
            value={paymentAlias}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-blue-950">
          CVU / CBU
          <input
            className="min-h-12 rounded-lg border border-blue-100 bg-blue-50 px-4 font-semibold text-blue-950 outline-none transition focus:border-yellow-400 focus:bg-white"
            maxLength={80}
            onChange={(event) => setPaymentCvu(event.target.value)}
            placeholder="Opcional"
            value={paymentCvu}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-blue-950 sm:col-span-2">
          Titular de la cuenta
          <input
            className="min-h-12 rounded-lg border border-blue-100 bg-blue-50 px-4 font-semibold text-blue-950 outline-none transition focus:border-yellow-400 focus:bg-white"
            maxLength={120}
            onChange={(event) => setPaymentHolderName(event.target.value)}
            placeholder="Nombre y apellido"
            value={paymentHolderName}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-blue-950 sm:col-span-2">
          Instrucciones de cobro
          <textarea
            className="min-h-32 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 font-semibold leading-6 text-blue-950 outline-none transition focus:border-yellow-400 focus:bg-white"
            maxLength={700}
            onChange={(event) => setPaymentNotes(event.target.value)}
            placeholder="Ej: acepto Mercado Pago, transferencia y efectivo en entrega. Enviar comprobante por mensaje."
            value={paymentNotes}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Metodos de cobro guardados.
        </p>
      ) : null}

      <button
        className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={saving}
        type="submit"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar metodos
      </button>
    </form>
  );
}
