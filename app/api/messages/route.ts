import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    body?: string;
    listingId?: string;
    recipientId?: string;
  };
  const body = payload.body?.trim();

  if (!body || body.length > 1500 || !payload.listingId || !payload.recipientId) {
    return NextResponse.json(
      { error: "Revisa el mensaje y la publicacion seleccionada." },
      { status: 400 }
    );
  }

  if (payload.recipientId === user.id) {
    return NextResponse.json(
      { error: "No puedes enviarte mensajes a ti mismo." },
      { status: 400 }
    );
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, moderation_status")
    .eq("id", payload.listingId)
    .maybeSingle();

  if (
    !listing ||
    listing.moderation_status !== "approved" ||
    (listing.seller_id !== user.id && listing.seller_id !== payload.recipientId)
  ) {
    return NextResponse.json(
      { error: "No puedes iniciar esta conversacion." },
      { status: 403 }
    );
  }

  if (listing.seller_id === user.id) {
    const { data: existingMessage } = await supabase
      .from("messages")
      .select("id")
      .eq("listing_id", payload.listingId)
      .eq("sender_id", payload.recipientId)
      .eq("recipient_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!existingMessage) {
      return NextResponse.json(
        { error: "Solo puedes responder conversaciones existentes." },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase.from("messages").insert({
    body,
    listing_id: payload.listingId,
    recipient_id: payload.recipientId,
    sender_id: user.id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
