import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z
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
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json(
      { error: "Acceso de administrador requerido." },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Acción invalida." },
      { status: 400 }
    );
  }

  const { data: raffle } = await supabase
    .from("raffles")
    .select("id, creator_id, title, moderation_status, closes_at")
    .eq("id", id)
    .maybeSingle();
  if (!raffle) {
    return NextResponse.json({ error: "Sorteo no encontrado." }, { status: 404 });
  }
  if (raffle.moderation_status !== "pending") {
    return NextResponse.json({ error: "El sorteo ya fue moderado." }, { status: 409 });
  }
  if (parsed.data.action === "approve" && new Date(raffle.closes_at).getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "No puedes aprobar un sorteo que ya finalizó." },
      { status: 400 }
    );
  }

  const approved = parsed.data.action === "approve";
  const { error } = await supabase
    .from("raffles")
    .update({
      moderation_status: approved ? "approved" : "rejected",
      rejection_reason: approved ? null : parsed.data.reason
    })
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await Promise.all([
    supabase.from("notifications").insert({
      body: approved
        ? `"${raffle.title}" ya está visible para la comunidad.`
        : parsed.data.reason,
      payload: { raffle_id: raffle.id },
      title: approved ? "Sorteo aprobado" : "Sorteo rechazado",
      type: approved ? "raffle_approved" : "raffle_rejected",
      user_id: raffle.creator_id
    }),
    supabase.from("audit_logs").insert({
      action: approved ? "raffle.approved" : "raffle.rejected",
      actor_id: user.id,
      entity_id: raffle.id,
      entity_type: "raffle",
      metadata: { reason: approved ? null : parsed.data.reason }
    })
  ]);

  return NextResponse.json({ error: null });
}
