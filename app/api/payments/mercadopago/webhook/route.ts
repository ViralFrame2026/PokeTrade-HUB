import { NextResponse } from "next/server";
import {
  getMercadoPagoPayment,
  paymentOrderStatusFromMercadoPago
} from "@/lib/mercado-pago";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

async function paymentIdFromRequest(request: Request) {
  const url = new URL(request.url);
  const fromQuery =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    url.searchParams.get("payment_id");

  if (fromQuery) return fromQuery;

  try {
    const body = await request.json();
    return body?.data?.id || body?.id || body?.resource?.split("/").pop() || null;
  } catch {
    return null;
  }
}

async function handleWebhook(request: Request) {
  const paymentId = await paymentIdFromRequest(request);

  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: "missing_payment_id" });
  }

  const payment = await getMercadoPagoPayment(String(paymentId));
  const orderId = payment.external_reference;

  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: "missing_external_reference" });
  }

  const service = createSupabaseServiceClient();
  const status = paymentOrderStatusFromMercadoPago(payment.status);

  const { data: order, error: updateError } = await service
    .from("payment_orders")
    .update({
      currency: payment.currency_id ?? "ARS",
      payment_id: String(payment.id),
      provider_status: payment.status ?? null,
      provider_status_detail: payment.status_detail ?? null,
      raw_payload: payment,
      status,
      paid_at: payment.date_approved ?? null
    })
    .eq("id", orderId)
    .select("id, status")
    .maybeSingle();

  if (updateError) throw updateError;

  if (order?.status === "approved") {
    const { error } = await service.rpc("confirm_paid_order", {
      target_order_id: order.id
    });

    if (error) throw error;
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    return await handleWebhook(request);
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    return await handleWebhook(request);
  } catch (error) {
    console.error("Mercado Pago webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

