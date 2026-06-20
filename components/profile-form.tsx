"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useState } from "react";

type ProfileFormProps = {
  initial: {
    bio: string;
    city: string;
    country: string;
    displayName: string;
    instagram: string;
    whatsapp: string;
  };
};

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-3 text-white outline-none transition placeholder:text-blue-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20";
const BIO_MAX_LENGTH = 500;
const DISPLAY_NAME_MAX_LENGTH = 80;

export function ProfileForm({ initial }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [city, setCity] = useState(initial.city);
  const [country, setCountry] = useState(initial.country);
  const [bio, setBio] = useState(initial.bio);
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp);
  const [instagram, setInstagram] = useState(initial.instagram);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bioRemaining = BIO_MAX_LENGTH - bio.length;
  const displayNameRemaining = DISPLAY_NAME_MAX_LENGTH - displayName.length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify({
          bio,
          city,
          country,
          displayName,
          instagram,
          whatsapp
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos actualizar tu perfil.");
      }

      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos actualizar tu perfil."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,.18)] sm:p-7"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-white sm:col-span-2">
          Nombre visible
          <input
            className={inputClass}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            minLength={2}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
          <span className="mt-1 block text-xs text-blue-200">
            {displayName.length}/2 mínimo | {displayNameRemaining} caracteres restantes
          </span>
        </label>

        <label className="text-sm font-bold text-white">
          Ciudad
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ej: Buenos Aires"
            value={city}
          />
        </label>

        <label className="text-sm font-bold text-white">
          País
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Ej: Argentina"
            value={country}
          />
        </label>

        <label className="text-sm font-bold text-white">
          WhatsApp
          <input
            className={inputClass}
            maxLength={30}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="Ej: +54 9 11 1234 5678"
            type="tel"
            value={whatsapp}
          />
        </label>

        <label className="text-sm font-bold text-white">
          Instagram
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setInstagram(event.target.value)}
            placeholder="Ej: @entrenador_tcg"
            value={instagram}
          />
        </label>

        <label className="text-sm font-bold text-white sm:col-span-2">
          Presentación
          <textarea
            className={`${inputClass} min-h-32`}
            maxLength={BIO_MAX_LENGTH}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Cuenta brevemente qué coleccionás o qué tipos de intercambios buscas."
            value={bio}
          />
          <span className="mt-1 block text-xs text-blue-200">
            {bioRemaining} caracteres restantes
          </span>
        </label>
      </div>

      <p className="mt-4 text-sm leading-6 text-blue-100">
        WhatsApp e Instagram solo se muestran como opciones de contacto en tus
        publicaciones. Son opcionales porque PokeTrade también tiene mensajes internos.
      </p>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-300/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-200">
          <CheckCircle2 className="h-5 w-5" />
          Perfil actualizado correctamente.
        </div>
      ) : null}

      <button
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Guardar perfil
      </button>
    </form>
  );
}
