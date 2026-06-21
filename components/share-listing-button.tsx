"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

type ShareListingButtonProps = {
  title: string;
};

export function ShareListingButton({ title }: ShareListingButtonProps) {
  const [copied, setCopied] = useState(false);

  async function shareListing() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Users can cancel the native share sheet; no visible error is needed.
    }
  }

  return (
    <button
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 py-3 font-bold text-blue-800 transition hover:bg-blue-50"
      onClick={shareListing}
      type="button"
    >
      {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      {copied ? "Enlace copiado" : "Compartir publicacion"}
    </button>
  );
}
