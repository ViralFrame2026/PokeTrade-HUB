"use client";

import { AlertTriangle, X } from "lucide-react";

type ConfirmActionModalProps = {
  body: string;
  cancelLabel?: string;
  confirmLabel?: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmActionModal({
  body,
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  isBusy = false,
  onCancel,
  onConfirm,
  title
}: ConfirmActionModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-yellow-300/40 bg-[#071535] text-white shadow-[0_28px_90px_rgba(0,0,0,.5)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-blue-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-yellow-400 text-blue-950">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <p className="font-black">{title}</p>
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300"
            disabled={isBusy}
            onClick={onCancel}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm font-semibold leading-6 text-blue-100">{body}</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-black text-white transition hover:border-yellow-300 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={onCancel}
              type="button"
            >
              {cancelLabel}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg border border-red-300 bg-red-500 px-4 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={onConfirm}
              type="button"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
