"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingCardFavoriteButtonProps = {
  detailHref: string;
  initialFavorite?: boolean;
  isExample?: boolean;
  listingId: string;
};

export function ListingCardFavoriteButton({
  detailHref,
  initialFavorite = false,
  isExample = false,
  listingId
}: ListingCardFavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFavorite() {
    if (isExample) {
      router.push(detailHref);
      return;
    }

    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites/${listingId}`, {
        method: isFavorite ? "DELETE" : "POST"
      });

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(detailHref)}`);
        return;
      }

      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos actualizar el favorito.");
      }

      setIsFavorite((current) => !current);
      router.refresh();
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
    <button
      aria-label={isFavorite ? "Quitar de favoritos" : "Guardar publicacion"}
      aria-pressed={isFavorite}
      className={`grid h-10 w-10 place-items-center rounded-md border transition ${
        isFavorite
          ? "border-yellow-300 bg-yellow-300 text-blue-950"
          : "border-white/10 text-blue-100 hover:border-yellow-300 hover:text-yellow-300"
      }`}
      disabled={isBusy}
      onClick={toggleFavorite}
      title={error ?? (isFavorite ? "Guardada en favoritos" : "Guardar publicacion")}
      type="button"
    >
      {isBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      )}
    </button>
  );
}
