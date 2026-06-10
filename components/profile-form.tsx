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
  "mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-3 text-blue-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

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
      className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm sm:p-7"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-blue-950 sm:col-span-2">
          Nombre visible
          <input
            className={inputClass}
            maxLength={80}
            minLength={2}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
        </label>

        <label className="text-sm font-bold text-blue-950">
          Ciudad
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ej: Buenos Aires"
            value={city}
          />
        </label>

        <label className="text-sm font-bold text-blue-950">
          Pais
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Ej: Argentina"
            value={country}
          />
        </label>

        <label className="text-sm font-bold text-blue-950">
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

        <label className="text-sm font-bold text-blue-950">
          Instagram
          <input
            className={inputClass}
            maxLength={100}
            onChange={(event) => setInstagram(event.target.value)}
            placeholder="Ej: @entrenador_tcg"
            value={instagram}
          />
        </label>

        <label className="text-sm font-bold text-blue-950 sm:col-span-2">
          Presentacion
          <textarea
            className={`${inputClass} min-h-32`}
            maxLength={500}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Cuenta brevemente que coleccionas o que tipos de intercambios buscas."
            value={bio}
          />
        </label>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        WhatsApp e Instagram solo se muestran como opciones de contacto en tus
        publicaciones. Debes completar al menos uno.
      </p>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
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
