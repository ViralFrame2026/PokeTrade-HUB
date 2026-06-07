import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("product_id, moderation_status, seller_id, listing_images(storage_path)")
    .eq("id", id)
    .maybeSingle();

  if (
    !listing ||
    listing.seller_id !== user.id ||
    listing.moderation_status !== "pending"
  ) {
    return NextResponse.json(
      { error: "La publicación no puede eliminarse." },
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
      { error: "No pudimos limpiar la publicación incompleta." },
      { status: 500 }
    );
  }

  return NextResponse.json({ error: null });
}
