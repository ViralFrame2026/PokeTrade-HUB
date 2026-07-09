import { NextResponse } from "next/server";
import { z } from "zod";
import { internalErrorResponse, invalidJsonResponse, readJsonBody } from "@/lib/api";
import { createMercadoPagoPreference, mercadoPagoConfigured } from "@/lib/mercado-pago";
import { firstRelated, productTitle } from "@/lib/product-display";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const checkoutSchema = z.object({
  listingId: z.string().uuid()
});

type Related<T> = T | T[] | null;

type CheckoutListing = {
  description: string | null;
  id: string;
  price: number | null;
  seller_id: string;
  status: string;
  title: string;
  type: string;
  moderation_status: string;
  products: Related<{
    title: string | null;
    cards: Related<{
      official_name: string;
      set_name: string;
    }>;
  }>;
};

export async function POST(request: Request) {
  if (!mercadoPagoConfigured()) {
    return NextResponse.json(
      { data: null, error: "Mercado Pago todavía no está configurado." },
      { status: 503 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: "Debes iniciar sesión para comprar." },
      { status: 401 }
    );
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Revisa la compra enviada.");
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: "Publicación inválida." }, { status: 400 });
  }

  try {
    const service = createSupabaseServiceClient();
    const { data: listing, error: listingError } = await service
      .from("listings")
      .select(
        "id, seller_id, title, description, type, status, moderation_status, price, products!listings_product_id_fkey(title, cards!products_card_id_fkey(official_name, set_name))"
      )
      .eq("id", parsed.data.listingId)
      .maybeSingle();

    if (listingError) throw listingError;

    const saleListing = listing as CheckoutListing | null;
    const product = firstRelated(saleListing?.products ?? null);

    if (
      !saleListing ||
      saleListing.type !== "sale" ||
      saleListing.status !== "active" ||
      saleListing.moderation_status !== "approved" ||
      !saleListing.price ||
      !product
    ) {
      return NextResponse.json(
        { data: null, error: "Esta publicación no está disponible para compra." },
        { status: 409 }
      );
    }

    if (saleListing.seller_id === user.id) {
      return NextResponse.json(
        { data: null, error: "No puedes comprar tu propia publicación." },
        { status: 400 }
      );
    }

    const orderId = crypto.randomUUID();
    const title = productTitle(product, saleListing.title);
    const amount = Number(saleListing.price);
    const { error: orderError } = await service.from("payment_orders").insert({
      amount,
      buyer_id: user.id,
      currency: "ARS",
      external_reference: orderId,
      id: orderId,
      listing_id: saleListing.id,
      seller_id: saleListing.seller_id,
      status: "pending"
    });

    if (orderError) throw orderError;

    try {
      const preference = await createMercadoPagoPreference({
        amount,
        buyerEmail: user.email,
        description: saleListing.description ?? title,
        listingId: saleListing.id,
        orderId,
        title
      });

      const checkoutUrl = preference.init_point ?? preference.sandbox_init_point ?? null;

      await service
        .from("payment_orders")
        .update({
          checkout_url: preference.init_point ?? null,
          preference_id: preference.id,
          sandbox_checkout_url: preference.sandbox_init_point ?? null
        })
        .eq("id", orderId);

      if (!checkoutUrl) {
        return NextResponse.json(
          { data: null, error: "Mercado Pago no devolvió un enlace de pago." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        data: {
          checkoutUrl,
          orderId
        },
        error: null
      });
    } catch (preferenceError) {
      await service
        .from("payment_orders")
        .update({
          provider_status: "preference_error",
          raw_payload: { error: String(preferenceError) },
          status: "cancelled"
        })
        .eq("id", orderId);

      throw preferenceError;
    }
  } catch (error) {
    return internalErrorResponse("No pudimos iniciar el pago.", error);
  }
}

