import { NextResponse } from "next/server";
import { z } from "zod";
import { internalErrorResponse } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const resolveReportSchema = z.object({
  note: z.string().trim().max(500).optional(),
  outcome: z
    .enum(["reviewed_no_issue", "seller_warned", "listing_action_taken"])
    .default("reviewed_no_issue")
});

const outcomeLabels = {
  listing_action_taken: "Tomamos medidas sobre la publicacion reportada.",
  reviewed_no_issue: "Revisamos el caso y no encontramos riesgo suficiente.",
  seller_warned: "Revisamos el caso y advertimos al vendedor."
};

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
    return NextResponse.json({ error: "Acceso de administrador requerido." }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({}));
  const parsed = resolveReportSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos invalidos." },
      { status: 400 }
    );
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id, reporter_id, listing_id, reason")
    .eq("id", id)
    .is("resolved_at", null)
    .maybeSingle();

  if (!report) {
    return NextResponse.json({ error: "Reporte no encontrado." }, { status: 404 });
  }

  const { error } = await supabase
    .from("reports")
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    })
    .eq("id", id)
    .is("resolved_at", null);

  if (error) {
    return internalErrorResponse("No pudimos resolver el reporte.", error);
  }

  await supabase.from("notifications").insert({
    body: parsed.data.note
      ? `${outcomeLabels[parsed.data.outcome]} Nota del equipo: ${parsed.data.note}`
      : outcomeLabels[parsed.data.outcome],
    payload: { listing_id: report.listing_id, report_id: report.id },
    title: "Reporte resuelto",
    type: "report_resolved",
    user_id: report.reporter_id
  });

  await supabase.from("audit_logs").insert({
    action: "report.resolved",
    actor_id: user.id,
    entity_id: report.id,
    entity_type: "report",
    metadata: {
      listing_id: report.listing_id,
      note: parsed.data.note ?? null,
      outcome: parsed.data.outcome,
      reason: report.reason
    }
  });

  return NextResponse.json({ error: null });
}
