"use client";

import { CalendarClock, Gift, Loader2, Users } from "lucide-react";
import { FormEvent, useState } from "react";

export function RaffleForm() {
  const [title, setTitle] = useState("");
  const [prize, setPrize] = useState("");
  const [requirements, setRequirements] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [entryLimit, setEntryLimit] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitRaffle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/raffles", {
        body: JSON.stringify({
          closesAt,
          entryLimit: entryLimit ? Number(entryLimit) : null,
          imageUrl: imageUrl.trim() || null,
          prize,
          requirements,
          title
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json()) as { error?: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos crear el sorteo.");
      }

      setSuccess("Sorteo enviado a moderacion.");
      setTitle("");
      setPrize("");
      setRequirements("");
      setClosesAt("");
      setEntryLimit("");
      setImageUrl("");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "No pudimos crear el sorteo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="glass rounded-lg p-5 sm:p-6" onSubmit={submitRaffle}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field icon={Gift} label="Titulo">
          <input
            className="field-input"
            maxLength={100}
            minLength={5}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Sorteo ETB Caos Creciente"
            required
            value={title}
          />
        </Field>
        <Field icon={Gift} label="Premio">
          <input
            className="field-input"
            maxLength={160}
            minLength={5}
            onChange={(event) => setPrize(event.target.value)}
            placeholder="Describe el producto entregado"
            required
            value={prize}
          />
        </Field>
        <Field icon={CalendarClock} label="Fecha de cierre">
          <input
            className="field-input"
            min={new Date().toISOString().slice(0, 16)}
            onChange={(event) => setClosesAt(event.target.value)}
            required
            type="datetime-local"
            value={closesAt}
          />
        </Field>
        <Field icon={Users} label="Limite de participantes">
          <input
            className="field-input"
            min="2"
            onChange={(event) => setEntryLimit(event.target.value)}
            placeholder="Opcional"
            type="number"
            value={entryLimit}
          />
        </Field>
      </div>

      <label className="mt-4 block text-sm font-bold text-slate-200">
        Imagen del premio
        <input
          className="field-input mt-2"
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="URL publica de la imagen (opcional)"
          type="url"
          value={imageUrl}
        />
      </label>

      <label className="mt-4 block text-sm font-bold text-slate-200">
        Requisitos
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
          maxLength={1000}
          minLength={10}
          onChange={(event) => setRequirements(event.target.value)}
          placeholder="Explica las condiciones de participacion y entrega"
          required
          value={requirements}
        />
      </label>

      <div className="mt-5 rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
        Esta primera modalidad es gratuita. No se permiten pagos, compras obligatorias
        ni cobros por participar.
      </div>
      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
          {success}
        </div>
      ) : null}
      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pokemonYellow px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gift className="h-5 w-5" />}
        Enviar sorteo a revision
      </button>
    </form>
  );
}

function Field({
  children,
  icon: Icon,
  label
}: {
  children: React.ReactNode;
  icon: typeof Gift;
  label: string;
}) {
  return (
    <label className="text-sm font-bold text-slate-200">
      {label}
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
        <div className="[&_.field-input]:w-full [&_.field-input]:rounded-lg [&_.field-input]:border [&_.field-input]:border-white/10 [&_.field-input]:bg-slate-950/70 [&_.field-input]:py-3 [&_.field-input]:pl-10 [&_.field-input]:pr-3 [&_.field-input]:text-white [&_.field-input]:outline-none [&_.field-input:focus]:border-pokemonYellow/60">
          {children}
        </div>
      </div>
    </label>
  );
}
