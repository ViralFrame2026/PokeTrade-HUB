"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutButtonProps = {
  isAuthenticated: boolean;
  listingId: string;
};

export function CheckoutButton({ isAuthenticated, listingId }: CheckoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function startCheckout() {
    setError(null);

    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/listings/${listingId}`)}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/checkout", {
        body: JSON.stringify({ listingId }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const payload = (await response.json()) as {
        data: { checkoutUrl: string } | null;
        error: string | null;
      };

      if (!response.ok || !payload.data?.checkoutUrl) {
        throw new Error(payload.error ?? "No pudimos iniciar el pago.");
      }

      window.location.href = payload.data.checkoutUrl;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "No pudimos iniciar el pago."
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-5 py-3 font-black text-blue-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
        onClick={startCheckout}
        type="button"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        {isLoading ? "Abriendo Mercado Pago..." : "Comprar con Mercado Pago"}
      </button>
      {error ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

