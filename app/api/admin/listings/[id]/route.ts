import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const moderationSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().max(500).nullable()
  })
  .superRefine((value, context) => {
    if (value.action === "reject" && (!value.reason || value.reason.length < 5)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El rechazo necesita un motivo.",
        path: ["reason"]
      });
    }
  });

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: "No autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ data: null, error: "Acceso de administrador requerido." }, { status: 403 });
  }

  const parsed = moderationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.issues[0]?.message ?? "Acción invalida." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const { data: currentListing, error: listingReadError } = await supabase
    .from("listings")
    .select("id, seller_id, title, moderation_status")
    .eq("id", id)
    .single();

  if (listingReadError || !currentListing) {
    return NextResponse.json({ data: null, error: "Publicación no encontrada." }, { status: 404 });
  }

  if (currentListing.moderation_status !== "pending") {
    return NextResponse.json(
      { data: null, error: "La publicación ya fue moderada." },
      { status: 409 }
    );
  }

  const approved = parsed.data.action === "approve";
  const { data: updatedListing, error: updateError } = await supabase
    .from("listings")
    .update({
      approved_at: approved ? new Date().toISOString() : null,
      moderation_status: approved ? "approved" : "rejected",
      rejection_reason: approved ? null : parsed.data.reason,
      status: approved ? "active" : "rejected"
    })
    .eq("id", id)
    .select("id, moderation_status")
    .single();

  if (updateError) {
    return NextResponse.json({ data: null, error: updateError.message }, { status: 500 });
  }

  await Promise.all([
    supabase.from("notifications").insert({
      body: approved
        ? `"${currentListing.title}" ya está visible en el marketplace.`
        : parsed.data.reason,
      payload: {
        listing_id: currentListing.id
      },
      title: approved ? "Publicación aprobada" : "Publicación rechazada",
      type: approved ? "listing_approved" : "listing_rejected",
      user_id: currentListing.seller_id
    }),
    supabase.from("audit_logs").insert({
      action: approved ? "listing.approved" : "listing.rejected",
      actor_id: user.id,
      entity_id: currentListing.id,
      entity_type: "listing",
      metadata: {
        reason: approved ? null : parsed.data.reason
      }
    })
  ]);

  return NextResponse.json({ data: updatedListing, error: null });
}
