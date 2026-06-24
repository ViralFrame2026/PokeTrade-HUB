import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateListingSchema = z
  .object({
    condition: z.enum([
      "Mint",
      "Near Mint",
      "Lightly Played",
      "Moderately Played",
      "Heavily Played",
      "Damaged"
    ]),
    description: z.string().trim().min(10).max(2000),
    locationCity: z.string().trim().min(2).max(100),
    locationCountry: z.string().trim().min(2).max(100),
    price: z.number().positive().max(999999999).nullable(),
    tradeWants: z.string().trim().max(1000).nullable(),
    type: z.enum(["sale", "trade", "free"])
  })
  .superRefine((value, context) => {
    if (value.type === "sale" && value.price === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las publicaciones de venta requieren un precio.",
        path: ["price"]
      });
    }

    if (value.type === "trade" && !value.tradeWants) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica que buscas a cambio.",
        path: ["tradeWants"]
      });
    }
  });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const parsed = updateListingSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos invalidos." },
      { status: 400 }
    );
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("product_id, moderation_status, seller_id")
    .eq("id", id)
    .maybeSingle();

  if (
    !listing ||
    listing.seller_id !== user.id ||
    !["pending", "rejected", "changes_requested"].includes(listing.moderation_status)
  ) {
    return NextResponse.json(
      { error: "Esta publicacion no puede editarse." },
      { status: 403 }
    );
  }

  const { error: listingError } = await supabase
    .from("listings")
    .update({
      description: parsed.data.description,
      location_city: parsed.data.locationCity,
      location_country: parsed.data.locationCountry,
      moderation_status: "pending",
      price: parsed.data.type === "sale" ? parsed.data.price : null,
      rejection_reason: null,
      status: "pending",
      trade_wants: parsed.data.type === "trade" ? parsed.data.tradeWants : null,
      type: parsed.data.type
    })
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .single();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      condition: parsed.data.condition,
      description: parsed.data.description
    })
    .eq("id", listing.product_id)
    .eq("owner_id", user.id);

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { data: listing } = await supabase
    .from("listings")
    .select("product_id, seller_id, title, listing_images(storage_path)")
    .eq("id", id)
    .maybeSingle();

  if (!listing || (listing.seller_id !== user.id && !profile?.is_admin)) {
    return NextResponse.json(
      { error: "La publicacion no puede eliminarse." },
      { status: 403 }
    );
  }

  const paths = (listing.listing_images ?? []).map(
    (image: { storage_path: string }) => image.storage_path
  );

  if (paths.length > 0) {
    await supabase.storage.from("listing-images").remove(paths);
  }

  const { error } = await supabase.from("products").delete().eq("id", listing.product_id);

  if (error) {
    return NextResponse.json(
      { error: "No pudimos eliminar la publicacion." },
      { status: 500 }
    );
  }

  const deletedByAdmin = listing.seller_id !== user.id && Boolean(profile?.is_admin);

  if (deletedByAdmin) {
    await supabase.from("notifications").insert({
      body: "Un administrador elimino tu publicacion por motivos de moderacion o seguridad.",
      payload: {
        listing_id: id
      },
      title: `Publicacion eliminada: ${listing.title}`,
      type: "listing_deleted",
      user_id: listing.seller_id
    });
  }

  await supabase.from("audit_logs").insert({
    action: "listing.deleted",
    actor_id: user.id,
    entity_id: id,
    entity_type: "listing",
    metadata: {
      deleted_by_admin: deletedByAdmin,
      seller_id: listing.seller_id
    }
  });

  return NextResponse.json({ error: null });
}
