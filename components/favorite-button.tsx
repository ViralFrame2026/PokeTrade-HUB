"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FavoriteButtonProps = {
  initialFavorite: boolean;
  isAuthenticated: boolean;
  listingId: string;
};

export function FavoriteButton({
  initialFavorite,
  isAuthenticated,
  listingId
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFavorite() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: isFavorite ? "DELETE" : "POST"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos actualizar el favorito.");
      }

      setIsFavorite((current) => !current);
    } catch (favoriteError) {
      setError(
        favoriteError instanceof Error
          ? favoriteError.message
          : "No pudimos actualizar el favorito."
      );
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        aria-pressed={isFavorite}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 font-black transition ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-blue-200 bg-white text-blue-800 hover:bg-blue-50"
        }`}
        disabled={isBusy}
        onClick={toggleFavorite}
        type="button"
      >
        {isBusy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
        )}
        {isFavorite ? "Guardada en favoritos" : "Guardar en favoritos"}
      </button>
      {error ? <p className="mt-2 text-center text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
