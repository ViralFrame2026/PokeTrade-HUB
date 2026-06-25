"use client";

import { ConfirmActionModal } from "@/components/confirm-action-modal";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteRaffleButtonProps = {
  onDeleted?: () => void;
  raffleId: string;
  redirectTo?: string;
  title: string;
};

export function DeleteRaffleButton({
  onDeleted,
  raffleId,
  redirectTo,
  title
}: DeleteRaffleButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/raffles/${raffleId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error: string | null };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No pudimos eliminar el sorteo.");
      }

      setIsDeleted(true);
      onDeleted?.();
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "No pudimos eliminar el sorteo."
      );
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  }

  return (
    <div>
      {isDeleted ? (
        <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-500">
          Eliminado
        </span>
      ) : (
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Eliminar
        </button>
      )}
      {isConfirming ? (
        <ConfirmActionModal
          body={`Vas a eliminar definitivamente el sorteo "${title}". Esta accion no se puede deshacer.`}
          confirmLabel="Si, eliminar"
          isBusy={isDeleting}
          onCancel={() => setIsConfirming(false)}
          onConfirm={handleDelete}
          title="Eliminar sorteo"
        />
      ) : null}
      {error ? <p className="mt-2 max-w-48 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
