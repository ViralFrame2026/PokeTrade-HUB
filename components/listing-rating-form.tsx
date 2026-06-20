"use client";

import { Loader2, Star } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ListingRatingForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRating(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ratings", {
        body: JSON.stringify({
          comment: comment.trim() || null,
          listingId,
          stars
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json()) as { error?: string | null };
      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos guardar tu valoración.");
      }
      router.refresh();
    } catch (ratingError) {
      setError(
        ratingError instanceof Error
          ? ratingError.message
          : "No pudimos guardar tu valoración."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="mt-5 rounded-lg border border-yellow-300 bg-yellow-50 p-5"
      onSubmit={submitRating}
    >
      <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-700">
        Operación finalizada
      </p>
      <h3 className="mt-2 text-lg font-black text-blue-950">Valora al vendedor</h3>
      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Estrellas">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            aria-label={`${value} estrella${value === 1 ? "" : "s"}`}
            aria-pressed={stars === value}
            className="grid h-10 w-10 place-items-center rounded-md transition hover:bg-yellow-100"
            key={value}
            onClick={() => setStars(value)}
            type="button"
          >
            <Star
              className={`h-6 w-6 ${
                value <= stars
                  ? "fill-yellow-400 text-yellow-500"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-bold text-slate-700">
        Comentario <span className="font-normal text-slate-400">(opcional)</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-lg border border-yellow-200 bg-white px-3 py-3 text-slate-800 outline-none focus:border-blue-500"
          maxLength={500}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Cuenta brevemente cómo fue la operación"
          value={comment}
        />
      </label>
      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 font-black text-white transition hover:bg-blue-800 disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
        Publicar valoración
      </button>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
    </form>
  );
}
