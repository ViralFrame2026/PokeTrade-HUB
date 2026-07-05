"use client";

import { CalendarClock, Gift, Loader2, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const TITLE_MAX_LENGTH = 100;
const PRIZE_MAX_LENGTH = 160;
const REQUIREMENTS_MAX_LENGTH = 1000;
const RAFFLE_DRAFT_KEY = "poketrade-raffle-draft";

type RaffleDraft = {
  closesAt: string;
  entryLimit: string;
  imageUrl: string;
  prize: string;
  requirements: string;
  title: string;
};

function minimumCloseDateTime() {
  const value = new Date(Date.now() + 60 * 60 * 1000);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 16);
}

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
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const minCloseDateTime = minimumCloseDateTime();
  const titleRemaining = TITLE_MAX_LENGTH - title.length;
  const prizeRemaining = PRIZE_MAX_LENGTH - prize.length;
  const requirementsRemaining = REQUIREMENTS_MAX_LENGTH - requirements.length;

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(RAFFLE_DRAFT_KEY);
      if (!storedDraft) return;

      const draft = JSON.parse(storedDraft) as Partial<RaffleDraft>;
      setTitle(draft.title ?? "");
      setPrize(draft.prize ?? "");
      setRequirements(draft.requirements ?? "");
      setClosesAt(draft.closesAt ?? "");
      setEntryLimit(draft.entryLimit ?? "");
      setImageUrl(draft.imageUrl ?? "");

      if (
        draft.title ||
        draft.prize ||
        draft.requirements ||
        draft.closesAt ||
        draft.entryLimit ||
        draft.imageUrl
      ) {
        setDraftNotice("Recuperamos tu borrador de sorteo.");
      }
    } catch {
      window.localStorage.removeItem(RAFFLE_DRAFT_KEY);
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isDraftReady) return;

    const draft: RaffleDraft = {
      closesAt,
      entryLimit,
      imageUrl,
      prize,
      requirements,
      title
    };

    window.localStorage.setItem(RAFFLE_DRAFT_KEY, JSON.stringify(draft));
  }, [closesAt, entryLimit, imageUrl, isDraftReady, prize, requirements, title]);

  function clearDraft() {
    window.localStorage.removeItem(RAFFLE_DRAFT_KEY);
    setDraftNotice(null);
  }

  function resetForm() {
    setTitle("");
    setPrize("");
    setRequirements("");
    setClosesAt("");
    setEntryLimit("");
    setImageUrl("");
    clearDraft();
  }

  async function submitRaffle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedImageUrl = imageUrl.trim();
    if (!normalizedImageUrl) {
      setError("Agrega una imagen publica del premio para poder revisar el sorteo.");
      return;
    }

    try {
      const parsedImageUrl = new URL(normalizedImageUrl);
      if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
        setError("La imagen del premio debe ser una URL publica http o https.");
        return;
      }
    } catch {
      setError("La imagen del premio debe ser una URL publica valida.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/raffles", {
        body: JSON.stringify({
          closesAt,
          entryLimit: entryLimit ? Number(entryLimit) : null,
          imageUrl: normalizedImageUrl,
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

      setSuccess("Sorteo enviado a moderación.");
      resetForm();
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
        <Field icon={Gift} label="Título">
          <input
            className="field-input"
            maxLength={TITLE_MAX_LENGTH}
            minLength={5}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Sorteo ETB Caos Creciente"
            required
            value={title}
          />
          <Counter current={title.length} max={TITLE_MAX_LENGTH} min={5} remaining={titleRemaining} />
        </Field>
        <Field icon={Gift} label="Premio">
          <input
            className="field-input"
            maxLength={PRIZE_MAX_LENGTH}
            minLength={5}
            onChange={(event) => setPrize(event.target.value)}
            placeholder="Describe el producto entregado"
            required
            value={prize}
          />
          <Counter current={prize.length} max={PRIZE_MAX_LENGTH} min={5} remaining={prizeRemaining} />
        </Field>
        <Field icon={CalendarClock} label="Fecha de cierre">
          <input
            className="field-input"
            min={minCloseDateTime}
            onChange={(event) => setClosesAt(event.target.value)}
            required
            type="datetime-local"
            value={closesAt}
          />
          <span className="mt-1 block text-xs text-slate-500">
            Debe cerrar al menos una hora después de crearlo.
          </span>
        </Field>
        <Field icon={Users} label="Límite de participantes">
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
          placeholder="URL publica de la imagen del premio"
          required
          type="url"
          value={imageUrl}
        />
        <span className="mt-1 block text-xs text-slate-500">
          Obligatoria: debe mostrar claramente el premio real que se va a entregar.
        </span>
      </label>

      <label className="mt-4 block text-sm font-bold text-slate-200">
        Requisitos
        <textarea
          className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-pokemonYellow/60"
          maxLength={REQUIREMENTS_MAX_LENGTH}
          minLength={10}
          onChange={(event) => setRequirements(event.target.value)}
          placeholder="Explica las condiciones de participación y entrega"
          required
          value={requirements}
        />
        <Counter
          current={requirements.length}
          max={REQUIREMENTS_MAX_LENGTH}
          min={10}
          remaining={requirementsRemaining}
        />
      </label>

      <div className="mt-5 rounded-lg border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
        Esta primera modalidad es gratuita. No se permiten pagos, compras obligatorias
        ni cobros por participar.
      </div>
      <div className="mt-4 rounded-lg border border-blue-300/20 bg-blue-500/10 p-4 text-xs leading-5 text-blue-100">
        Al aprobarse, el sorteo aparecerá público. Cuando cierre, el organizador podrá
        seleccionar un ganador desde su cuenta y el resultado quedará visible.
      </div>
      {error ? (
        <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}
      {draftNotice ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-300/30 bg-blue-500/10 p-4 text-sm font-semibold text-blue-100">
          <span>{draftNotice}</span>
          <button
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-pokemonYellow/60 hover:text-pokemonYellow"
            onClick={() => {
              resetForm();
              setSuccess(null);
              setError(null);
            }}
            type="button"
          >
            Empezar de cero
          </button>
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
        Enviar sorteo a revisión
      </button>
    </form>
  );
}

function Counter({
  current,
  max,
  min,
  remaining
}: {
  current: number;
  max: number;
  min: number;
  remaining: number;
}) {
  return (
    <span className="mt-1 block text-xs text-slate-500">
      {current}/{min} mínimo | {remaining} de {max} caracteres restantes
    </span>
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
