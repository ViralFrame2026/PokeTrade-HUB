"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_MESSAGE_LENGTH = 1500;

export function MessageComposer({
  listingId,
  recipientId
}: {
  listingId: string;
  recipientId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const remainingCharacters = MAX_MESSAGE_LENGTH - body.length;

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = body.trim();
    if (!message) return;

    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        body: JSON.stringify({ body: message, listingId, recipientId }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        throw new Error(result.error ?? "No pudimos enviar el mensaje.");
      }

      setBody("");
      router.refresh();
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "No pudimos enviar el mensaje."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="border-t border-blue-100 bg-white p-4" onSubmit={sendMessage}>
      <label className="sr-only" htmlFor="message-body">
        Escribe un mensaje
      </label>
      <div className="flex items-end gap-2">
        <textarea
          className="min-h-12 flex-1 resize-none rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          disabled={isSending}
          id="message-body"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Escribe tu mensaje..."
          rows={2}
          value={body}
        />
        <button
          aria-label="Enviar mensaje"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-yellow-400 text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSending || !body.trim()}
          type="submit"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="text-slate-500">Ctrl + Enter para enviar</span>
        <span className={remainingCharacters < 120 ? "text-red-600" : "text-slate-400"}>
          {remainingCharacters} caracteres restantes
        </span>
      </div>
      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
    </form>
  );
}
