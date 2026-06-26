"use client";

import { CheckCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAllNotificationsReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  async function markAllRead() {
    setIsBusy(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/notifications", { method: "PATCH" });
      if (!response.ok) {
        throw new Error("No pudimos actualizar las notificaciones.");
      }

      setStatus("done");
      window.setTimeout(() => setStatus("idle"), 2500);
      router.refresh();
    } catch {
      setStatus("error");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 text-sm font-black text-blue-800 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || isBusy}
        onClick={markAllRead}
        type="button"
      >
        {isBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "done" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <CheckCheck className="h-4 w-4" />
        )}
        {status === "done" ? "Listo" : "Marcar todas como leidas"}
      </button>
      {status === "error" ? (
        <p className="mt-2 text-xs font-semibold text-red-600">
          No pudimos actualizar las notificaciones.
        </p>
      ) : null}
    </div>
  );
}

export function NotificationLink({
  children,
  href,
  notificationId
}: {
  children: React.ReactNode;
  href: string;
  notificationId: string;
}) {
  const router = useRouter();

  async function openNotification() {
    await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
    router.push(href);
  }

  return (
    <button
      className="mt-4 text-sm font-black text-blue-700 hover:text-blue-900"
      onClick={openNotification}
      type="button"
    >
      {children}
    </button>
  );
}
