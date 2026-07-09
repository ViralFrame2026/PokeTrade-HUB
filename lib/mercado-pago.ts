import { siteUrl } from "@/lib/site-url";

type MercadoPagoPreferenceInput = {
  amount: number;
  buyerEmail?: string | null;
  description: string;
  listingId: string;
  orderId: string;
  title: string;
};

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: number;
  external_reference?: string;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string;
};

function accessToken() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Missing Mercado Pago access token.");
  }

  return token;
}

export function mercadoPagoConfigured() {
  return Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);
}

export function paymentOrderStatusFromMercadoPago(status?: string) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  if (status === "refunded" || status === "charged_back") return "refunded";
  return "pending";
}

export async function createMercadoPagoPreference({
  amount,
  buyerEmail,
  description,
  listingId,
  orderId,
  title
}: MercadoPagoPreferenceInput) {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    body: JSON.stringify({
      auto_return: "approved",
      back_urls: {
        failure: siteUrl(`/payments/failure?order_id=${orderId}`),
        pending: siteUrl(`/payments/pending?order_id=${orderId}`),
        success: siteUrl(`/payments/success?order_id=${orderId}`)
      },
      binary_mode: false,
      external_reference: orderId,
      items: [
        {
          currency_id: "ARS",
          description,
          id: listingId,
          quantity: 1,
          title,
          unit_price: amount
        }
      ],
      metadata: {
        listing_id: listingId,
        order_id: orderId
      },
      notification_url: siteUrl("/api/payments/mercadopago/webhook"),
      payer: buyerEmail ? { email: buyerEmail } : undefined,
      statement_descriptor: "NEXOTCG"
    }),
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  const payload = (await response.json()) as MercadoPagoPreferenceResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Mercado Pago preference failed.");
  }

  return payload;
}

export async function getMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken()}`
    }
  });

  const payload = (await response.json()) as MercadoPagoPaymentResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Mercado Pago payment lookup failed.");
  }

  return payload;
}

