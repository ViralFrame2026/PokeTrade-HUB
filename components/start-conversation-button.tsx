"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function StartConversationButton({
  isAuthenticated,
  listingId,
  sellerId
}: {
  isAuthenticated: boolean;
  listingId: string;
  sellerId: string;
}) {
  const router = useRouter();

  function openConversation() {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }

    router.push(`/account/messages/${listingId}/${sellerId}`);
  }

  return (
    <button
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-4 font-black text-white transition hover:bg-blue-800"
      onClick={openConversation}
      type="button"
    >
      <MessageCircle className="h-5 w-5" />
      Enviar mensaje
    </button>
  );
}
