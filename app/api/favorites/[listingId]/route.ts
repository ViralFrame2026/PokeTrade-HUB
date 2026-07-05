import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ listingId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { listingId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .eq("moderation_status", "approved")
    .eq("status", "active")
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Publicación no disponible." }, { status: 404 });
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: "No puedes guardar tu propia publicacion." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("favorites").insert({
    listing_id: listingId,
    user_id: user.id
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { listingId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
