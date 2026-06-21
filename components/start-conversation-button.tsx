"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function StartConversationButton({
  isAuthenticated,
  listingId,
  listingType,
  sellerId
}: {
  isAuthenticated: boolean;
  listingId: string;
  listingType: string;
  sellerId: string;
}) {
  const router = useRouter();
  const intent = listingType === "trade" ? "trade" : listingType === "free" ? "free" : "sale";
  const label =
    listingType === "trade"
      ? "Proponer intercambio"
      : listingType === "free"
        ? "Consultar producto"
        : "Me interesa comprar";

  function openConversation() {
    const conversationPath = `/account/messages/${listingId}/${sellerId}?intent=${intent}`;

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(conversationPath)}`);
      return;
    }

    router.push(conversationPath);
  }

  return (
    <button
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-4 font-black text-white transition hover:bg-blue-800"
      onClick={openConversation}
      type="button"
    >
      <MessageCircle className="h-5 w-5" />
      {label}
    </button>
  );
}
