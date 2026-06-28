"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_MESSAGE_LENGTH = 1500;

function quickMessages(intent: string, listingType: string) {
  if (intent === "trade" || listingType === "trade") {
    return [
      "Hola, sigue disponible para intercambio?",
      "Tengo productos para ofrecer, que estas buscando?",
      "Podes compartir mas fotos reales?",
      "En que zona podriamos coordinar?"
    ];
  }

  if (intent === "free" || listingType === "free") {
    return [
      "Hola, sigue disponible?",
      "Como podemos coordinar la entrega?",
      "Podes compartir mas fotos reales?",
      "En que zona entregas?"
    ];
  }

  return [
    "Hola, sigue disponible?",
    "Me interesa comprarla, el precio sigue siendo el publicado?",
    "Podes compartir mas fotos reales?",
    "En que zona entregas?"
  ];
}

export function MessageComposer({
  intent = "sale",
  listingId,
  listingType,
  recipientId
}: {
  intent?: string;
  listingId: string;
  listingType: string;
  recipientId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const remainingCharacters = MAX_MESSAGE_LENGTH - body.length;
  const messages = quickMessages(intent, listingType);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = body.trim();
    if (!message) return;

    setError(null);
    setSent(false);
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
      setSent(true);
      window.setTimeout(() => setSent(false), 2800);
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
    <form className="border-t border-white/10 bg-[#071535] p-4" onSubmit={sendMessage}>
      <label className="sr-only" htmlFor="message-body">
        Escribe un mensaje
      </label>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {messages.map((message) => (
          <button
            className="shrink-0 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-blue-100 transition hover:border-yellow-300 hover:text-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSending}
            key={message}
            onClick={() => setBody((current) => (current ? `${current}\n${message}` : message))}
            type="button"
          >
            {message}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          className="min-h-12 flex-1 resize-none rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-blue-200 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20"
          disabled={isSending}
          id="message-body"
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => {
            setBody(event.target.value);
            setSent(false);
          }}
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
        <span className="text-blue-200">Ctrl + Enter para enviar</span>
        <span className={remainingCharacters < 120 ? "text-red-300" : "text-blue-200"}>
          {remainingCharacters} caracteres restantes
        </span>
      </div>
      {sent ? (
        <p className="mt-2 flex items-center gap-2 text-sm font-black text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Mensaje enviado
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm font-semibold text-red-300">{error}</p> : null}
    </form>
  );
}
