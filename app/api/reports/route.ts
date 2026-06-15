import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  details: z.string().trim().min(10).max(1000),
  listingId: z.string().uuid(),
  reason: z.enum([
    "fake_listing",
    "missing_product",
    "misleading_information",
    "scam",
    "suspicious_behavior"
  ])
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 });
  }

  const parsed = reportSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Reporte invalido." },
      { status: 400 }
    );
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", parsed.data.listingId)
    .eq("moderation_status", "approved")
    .maybeSingle();

  if (!listing) {
    return NextResponse.json({ error: "Publicacion no encontrada." }, { status: 404 });
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: "No puedes reportar tu propia publicacion." },
      { status: 400 }
    );
  }

  const { data: existingReport } = await supabase
    .from("reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("listing_id", listing.id)
    .is("resolved_at", null)
    .maybeSingle();

  if (existingReport) {
    return NextResponse.json(
      { error: "Ya enviaste un reporte abierto para esta publicacion." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("reports").insert({
    details: parsed.data.details,
    listing_id: listing.id,
    reason: parsed.data.reason,
    reported_user_id: listing.seller_id,
    reporter_id: user.id
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: null });
}
