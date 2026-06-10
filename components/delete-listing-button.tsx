"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteListingButtonProps = {
  listingId: string;
  title: string;
};

export function DeleteListingButton({
  listingId,
  title
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente la publicacion de "${title}"? Esta accion no se puede deshacer.`
    );

    if (!confirmed) return;

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos eliminar la publicacion.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No pudimos eliminar la publicacion."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <button
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isDeleting}
        onClick={handleDelete}
        type="button"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Eliminar
      </button>
      {error ? <p className="mt-2 max-w-48 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
