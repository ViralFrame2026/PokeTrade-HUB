import { NextResponse } from "next/server";
import { z } from "zod";
import { internalErrorResponse, invalidJsonResponse, readJsonBody } from "@/lib/api";
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
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const body = await readJsonBody(request);
  if (!body) {
    return invalidJsonResponse("Revisa el reporte enviado.");
  }

  const parsed = reportSchema.safeParse(body);

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
    return NextResponse.json({ error: "Publicación no encontrada." }, { status: 404 });
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json(
      { error: "No puedes reportar tu propia publicación." },
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
      { error: "Ya enviaste un reporte abierto para esta publicación." },
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
    return internalErrorResponse("No pudimos enviar el reporte.", error);
  }

  return NextResponse.json({ error: null });
}
